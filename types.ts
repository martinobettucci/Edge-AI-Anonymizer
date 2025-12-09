
export interface PlaceholderMap {
  [placeholder: string]: string;
}

export interface AnonymizeResult {
  anonymizedText: string;
  placeholderMap: PlaceholderMap;
}
