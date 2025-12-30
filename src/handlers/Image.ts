import sharp, { Channels, kernel } from "sharp";

const ImageApi = {
  resizeImage: async (
    imageData: string,
    width: number,
    kernel: keyof typeof sharp.kernel = sharp.kernel.nearest
  ): Promise<string> => {
    const buffer = Buffer.from(imageData, "base64");
    const resizedBuffer = await sharp(buffer)
      .resize(width, null, {
        fit: sharp.fit.outside,
        kernel,
        withoutEnlargement: false,
      })
      .toBuffer();
    return resizedBuffer.toString("base64");
  },
  cropImage: async (
    imageData: string,
    cropX: number,
    cropY: number,
    width: number,
    height: number
  ): Promise<string> => {
    const image = sharp(Buffer.from(imageData, "base64"));
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error("Invalid image dimensions");
    }
    console.log(`Original image size: ${metadata.width}x${metadata.height}`);

    const croppedImageBuffer = await image
      .extract({
        left: Math.round((cropX / 100) * metadata.width),
        top: Math.round((cropY / 100) * metadata.height),
        width: Math.round((width / 100) * metadata.width),
        height: Math.round((height / 100) * metadata.height),
      })
      .toBuffer();

    return croppedImageBuffer.toString("base64");
  },
  processImage: async (
    imageData: string,
    imageOptions: ImageOptions
  ): Promise<string> => {
    const { cropX, cropY, zoom, width, height, sizeWidth, algorithm } =
      imageOptions;
    console.log(
      `Processing image with width: ${width}, height: ${height}, cropX: ${cropX}, cropY: ${cropY}`
    );
    const croppedImage = await ImageApi.cropImage(
      imageData,
      cropX,
      cropY,
      width,
      height
    );

    const adjustedWidth =
      sizeWidth == width ? Math.round(sizeWidth * zoom) : sizeWidth;

    const resizedImage = await ImageApi.resizeImage(
      croppedImage,
      adjustedWidth,
      algorithm as keyof typeof kernel
    );
    return resizedImage;
  },
  toPixels: async (
    imageData: string
  ): Promise<{ data: Buffer; info: sharp.OutputInfo }> => {
    const image = sharp(Buffer.from(imageData, "base64"));
    const pixelData = await image
      .raw()
      .ensureAlpha()
      .toBuffer({ resolveWithObject: true });

    return {
      data: pixelData.data,
      info: pixelData.info,
    };
  },
  fromPixels: async (
    data: Uint8ClampedArray | Buffer,
    info: { width: number; height: number; channels: number }
  ): Promise<string> => {
    const imageBuffer = await sharp(data, {
      raw: {
        width: info.width,
        height: info.height,
        channels: info.channels as Channels,
      },
    })
      .png()
      .toBuffer();
    return imageBuffer.toString("base64");
  }
};

export { ImageApi };
