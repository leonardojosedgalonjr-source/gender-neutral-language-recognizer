export interface RecognitionRule {
  readonly term: string;
  readonly alternative: string;
}
export interface RecognitionMatch extends RecognitionRule {
  readonly originalText: string;
  readonly start: number;
  readonly end: number;
}
export interface AggregatedResult extends RecognitionRule {
  readonly count: number;
}
export interface RecognitionSummary {
  readonly matches: readonly RecognitionMatch[];
  readonly results: readonly AggregatedResult[];
  readonly totalOccurrences: number;
  readonly distinctTerms: number;
}
export type FileProcessingState =
  | { status: 'idle' }
  | { status: 'loading'; filename: string }
  | { status: 'error'; filename: string; message: string }
  | {
      status: 'success';
      filename: string;
      text: string;
      summary: RecognitionSummary;
    };
