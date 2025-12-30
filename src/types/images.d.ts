declare interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

declare interface ImageOptions {
  cropX: number;
  cropY: number;
  zoom: number;
  width: number;
  height: number;
  sizeWidth: number;
  algorithm?: string;
}