export type AnnotationType = 'rect' | 'arrow' | 'text';

export interface Annotation {
  id: string;
  type: AnnotationType;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  text?: string;
}

export type DocumentType = 'image' | 'pdf';

export interface UploadedDocument {
  id: string;
  name: string;
  type: DocumentType;
  src: string;
  mimeType: string;
}
