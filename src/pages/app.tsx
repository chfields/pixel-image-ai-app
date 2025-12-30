import { addToast, Button, Card, CardHeader } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useCallback, useEffect, useState } from "react";
import PreviewImage from "../components/PreviewImage";
import PixelDisplay from "../components/PixelDisplay";

const App: React.FC = () => {
  const [image, setImage] = useState<string>("");
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [currentDirectory, setCurrentDirectory] = useState<string>(() => {
    return localStorage.getItem("currentDirectory") || "";
  });

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
    const png = await window.imageAPI.fromPixels(
      pixels!,
      {
        width: pixelInfo!.width,
        height: pixelInfo!.height,
        channels: pixelInfo!.channels,
      }
    );
    if (!currentDirectory) {
      alert("Please select a directory first.");
      return;
    }
    const fileName = `edited_image_${Date.now()}.png`;
    await window.fileAPI.writeFileFromBase64(
      currentDirectory,
      fileName,
      png
    );
    addToast({
      // color: "success",
      title: "Image Saved",
      description: `Image saved as ${fileName} in ${currentDirectory}`
    });
  }, [pixels, dimensions, pixelInfo, currentDirectory]);


  return (
    <div className="w-full">
      <Button
        className="m-4"
        onPress={async () => {
          const directories = await window.fileAPI.selectDirectory();
          if (directories.length > 0) {
            setCurrentDirectory(directories[0]);
            localStorage.setItem("currentDirectory", directories[0]);
          }
        }}
      >
        {currentDirectory ? `Directory: ${currentDirectory}` : "Select Directory"}
      </Button>
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
