import { Button, Card, CardHeader } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useCallback, useEffect, useState } from "react";
import PreviewImage from "../components/PreviewImage";
import PixelDisplay from "../components/PixelDisplay";

const App: React.FC = () => {
  const [image, setImage] = useState<string>("");
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [pixelInfo, setPixelInfo] = useState<{
    width: number;
    height: number;
    channels: number;
  } | null>(null);
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 16,
    height: 50,
  });

  useEffect(() => {
    if (!sizedImage) return;
    window.imageAPI
      .toPixels(sizedImage)
      .then(
        (pixelData: {
          data: Buffer;
          info: { width: number; height: number; channels: number };
        }) => {
          const pixelArray = new Uint8ClampedArray(pixelData.data.buffer);
          setPixels(pixelArray);
          setPixelInfo(pixelData.info);
          console.log("Pixel data:", pixelData);
        }
      );
  }, [sizedImage]);

  const downloadEditedImage = useCallback(async () => {
    // put pixels on canvas and download as png
    const canvas = document.createElement("canvas");
    canvas.width = pixelInfo.width || dimensions.width;
    // calculate height from pixels length
    const calcluatedHeight = pixels!.length / ((pixelInfo.width || dimensions.width) * 4);
    canvas.height = calcluatedHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const imageData = new ImageData(
      new Uint8ClampedArray(pixels!),
      canvas.width,
      calcluatedHeight,
      {}
    );
    ctx.putImageData(imageData, 0, 0);
    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resized_image.png";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }, "image/png");
  }, [pixels, dimensions, pixelInfo]);


  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} />
      </div>
      <div className="flex flex-row w-full gap-8 mt-4 justify-center items-start m-2 p-2">
        <Card title="Generated Image Preview" className="w-full p-6">
          <PreviewImage
            className="rounded-md"
            image={image}
            width={dimensions.width}
            height={dimensions.height}
            setSizedImage={setSizedImage}
            dimensions={dimensions}
          />
        </Card>
        <Card title="Pixel Data Preview" className="min-w-1/2  p-4">
          <CardHeader title="Pixel Data Preview">
            <Button size="sm" onPress={
              downloadEditedImage
            }
            >Download Pixel Data as PNG</Button>

          </CardHeader>
          <PixelDisplay
            pixels={pixels}
            pixelHeight={dimensions.height}
            pixelWidth={dimensions.width}
            width={pixelInfo?.width ?? dimensions.width}
            pixelSize={5}
            gap={8}
            showOutline={true}
            isTree={false}
            setPixels={(newPixels: Uint8ClampedArray) => {}}
          />
        </Card>
      </div>
    </div>
  );
};

export default App;
