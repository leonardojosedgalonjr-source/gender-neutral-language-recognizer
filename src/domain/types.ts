export interface RecognitionRule {
  readonly term: string;
  readonly alternative: string;
}
export const categories = [
  'Occupations',
  'Leadership',
  'Public service',
  'Education',
  'Pronouns',
  'General language',
] as const;
export type Category = (typeof categories)[number];
export interface CategorizedRule extends RecognitionRule {
  readonly category: Category;
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
export type DocumentType = 'txt' | 'pdf' | 'docx';
export interface ExtractedDocument {
  readonly filename: string;
  readonly type: DocumentType;
  readonly text: string;
  readonly pageCount?: number;
  readonly warnings: readonly string[];
}
export type FileProcessingState =
  | { status: 'idle' }
  | { status: 'loading'; filename: string; size: number }
  | { status: 'error'; filename: string; size: number; message: string }
  | {
      status: 'success';
      filename: string;
      size: number;
      document: ExtractedDocument;
      summary: RecognitionSummary;
    };
