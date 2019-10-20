export interface FaceImage {
  faceCode: string;
  src: string;
  position: Position;
  size: Size;
  animation?: Animation;
}

export interface Animation {
  from: Position;
  to: Position;
  duration: number;
  steps: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
