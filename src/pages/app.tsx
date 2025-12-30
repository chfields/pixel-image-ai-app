import { Button, Card } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useEffect, useState } from "react";
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
  return (
    <div className="w-full">
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} />
      </div>
      <div className="flex flex-row w-full gap-8 mt-4 justify-center items-start m-4 p-2">
        <Card title="Generated Image Preview" className="w-full">
          <PreviewImage
            // className="max-w-1/2"
            image={image}
            width={dimensions.width}
            height={dimensions.height}
            setSizedImage={setSizedImage}
            dimensions={dimensions}
          />
        </Card>
        <Card title="Pixel Data Preview" className="min-w-1/2  p-4">
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
