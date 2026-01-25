export type ProcessingStatus = 'idle' | 'uploading' | 'analyzing' | 'playing' | 'error';

export interface AnalysisResponse {
  audioBlob: Blob;
  description: string;
  detectedObjects: string[];
}