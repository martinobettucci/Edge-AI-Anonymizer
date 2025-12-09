import { pipeline, env } from '@xenova/transformers';
import type { AnonymizeResult, PlaceholderMap } from '../types';

// Configure Transformers.js to skip local file checks in browser
env.allowLocalModels = false;
env.useBrowserCache = true;

interface PiiEntity {
  start: number;
  end: number;
  text: string;
  type: string;
  score: number;
  source: 'MODEL';
}

let classifier: any = null;
let modelLoadingPromise: Promise<any> | null = null;

/**
 * Preloads the NER model.
 */
export const loadModel = async (progressCallback?: (data: any) => void) => {
  if (classifier) return classifier;
  if (modelLoadingPromise) return modelLoadingPromise;

  // Using a quantized version of BERT Multilingual for efficient browser inference
  // This downloads 'model_quantized.onnx' by default when quantized is true
  modelLoadingPromise = pipeline(
    'token-classification',
    'huantd/camembert-ner',
    {
      quantized: true,
      progress_callback: progressCallback,
    }
  ).then((c) => {
    classifier = c;
    return c;
  });

  return modelLoadingPromise;
};

export const anonymizeText = async (
  text: string,
  progressCallback?: (data: any) => void
): Promise<AnonymizeResult> => {
  const entities: PiiEntity[] = [];

  // 1. Run AI Model Analysis (NER) only
  try {
    const ner = await loadModel(progressCallback);

    // ignore_labels: ['O'] filters non-entity tokens
    // aggregation_strategy: 'simple' merges B-PER and I-PER tokens into a single entity
    const output = await ner(text, {
      ignore_labels: ['O'],
      aggregation_strategy: 'simple',
    });

    for (const item of output as any[]) {
      // Determine the type
      let type = item.entity_group || item.entity || item.label;

      // Clean up BIO tags if present (e.g., B-PER -> PER)
      if (type && (type.startsWith('B-') || type.startsWith('I-'))) {
        type = type.substring(2);
      }

      if (!type) {
        // Skip if we cannot determine a type
        continue;
      }

      // Map model labels to generic entity types
      if (type === 'PER' || type === 'PERSON') type = 'PERSON';
      if (type === 'LOC' || type === 'LOCATION') type = 'LOCATION';
      if (type === 'ORG' || type === 'ORGANIZATION') type = 'ORGANIZATION';

      const start: number = item.start;
      const end: number = item.end;

      // Basic span validation
      if (
        typeof start !== 'number' ||
        typeof end !== 'number' ||
        start < 0 ||
        end <= start ||
        end > text.length
      ) {
        continue;
      }

      const originalValue = text.slice(start, end);

      // Avoid anonymizing empty or whitespace-only spans
      if (!originalValue.trim()) {
        continue;
      }

      entities.push({
        start,
        end,
        text: originalValue,
        type,
        score: item.score,
        source: 'MODEL',
      });
    }
  } catch (error) {
    console.error('NER model inference failed', error);
    // If the model fails, we return the text as-is with an empty map
    return { anonymizedText: text, placeholderMap: {} };
  }

  // 2. Resolve overlaps between NER entities only
  // Sort by start position, then by descending score
  entities.sort((a, b) => {
    if (a.start !== b.start) return a.start - b.start;
    return b.score - a.score;
  });

  const finalEntities: PiiEntity[] = [];

  for (const current of entities) {
    let overlaps = false;

    for (const accepted of finalEntities) {
      if (doOverlap(current, accepted)) {
        overlaps = true;
        break;
      }
    }

    if (!overlaps) {
      finalEntities.push(current);
    }
  }

  // Ensure correct replacement order
  finalEntities.sort((a, b) => a.start - b.start);

  // 3. Create Anonymized Text and Map
  let anonymizedText = '';
  let lastIndex = 0;
  const placeholderMap: PlaceholderMap = {};
  const typeCounters: { [key: string]: number } = {};

  for (const entity of finalEntities) {
    // Append text before entity
    anonymizedText += text.slice(lastIndex, entity.start);

    // Extract exact original text based on indices to ensure clean replacement
    const originalValue = text.slice(entity.start, entity.end);

    // Generate Placeholder
    const entityType = entity.type || 'ENTITY';
    typeCounters[entityType] = (typeCounters[entityType] || 0) + 1;
    const placeholder = `<${entityType}_${typeCounters[entityType]}>`;

    placeholderMap[placeholder] = originalValue;
    anonymizedText += placeholder;

    lastIndex = entity.end;
  }

  // Append remaining text
  anonymizedText += text.slice(lastIndex);

  return { anonymizedText, placeholderMap };
};

export const deanonymizeText = async (
  anonymizedText: string,
  placeholderMap: PlaceholderMap
): Promise<string> => {
  let restoredText = anonymizedText;

  // Sort keys by length (descending) to prevent partial replacements of nested placeholders if any exist
  const sortedKeys = Object.keys(placeholderMap).sort(
    (a, b) => b.length - a.length
  );

  for (const placeholder of sortedKeys) {
    const originalValue = placeholderMap[placeholder];
    const escapedPlaceholder = placeholder.replace(
      /[.*+?^${}()|[\]\\]/g,
      '\\$&'
    );
    restoredText = restoredText.replace(
      new RegExp(escapedPlaceholder, 'g'),
      originalValue
    );
  }

  return restoredText;
};

// Helper to check overlap
function doOverlap(a: PiiEntity, b: PiiEntity): boolean {
  return a.start < b.end && b.start < a.end;
}
