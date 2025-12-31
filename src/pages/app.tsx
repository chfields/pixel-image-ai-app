import { addToast, Button, Card, CardHeader } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useCallback, useEffect, useMemo, useState } from "react";
import PreviewImage from "../components/PreviewImage";
import PixelDisplay from "../components/PixelDisplay";
import AppNavBar from "../components/NavBar";
import { App } from "electron";

const App: React.FC = () => {
  const [image, setImage] = useState<string>("");
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>( () => {
    const savedDirectory = localStorage.getItem("currentDirectory");
    return {
      directory: savedDirectory || "",
      dimensions: {
        width: parseInt(localStorage.getItem("columns") || "16", 10),
        height: parseInt(localStorage.getItem("rows") || "50", 10),
      },
    };
  });

  const [pixelInfo, setPixelInfo] = useState<{
    width: number;
    height: number;
    channels: number;
  } | null>(null);


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
      pixels,
      {
        width: pixelInfo?.width,
        height: pixelInfo?.height,
        channels: pixelInfo?.channels,
      }
    );
    if (!appSettings?.directory) {
      alert("Please select a directory first.");
      return;
    }
    // name should be last part of path + elementtype + index + .png
    const lastofPath = appSettings.directory.split("/").pop() || "image";
    const fileName = `${lastofPath}_${appSettings.elementType || "image"}.png`;
    const finalPath = await window.fileAPI.writeFileFromBase64(
      `${appSettings?.directory}/images`,
      fileName,
      png
    );
    addToast({
      color: "success",
      title: "Image Saved",
      description: `Image saved as ${finalPath}`
    });
  }, [pixels, pixelInfo, appSettings]);

  const dimensions = useMemo(() => {
    return appSettings.dimensions;
  }, [appSettings]);

  return (
    <div className="w-full">
      <AppNavBar settings={appSettings} setSettings={setAppSettings} actions={{ download: downloadEditedImage }} />
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} />
      </div>
      <div className="flex flex-row w-full gap-4 mt-2 justify-center items-start p-2">
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
        <Card title="Pixel Data Preview" className="w-full p-4">
          <PixelDisplay
            pixels={pixels}
            pixelHeight={dimensions.height}
            pixelWidth={dimensions.width}
            width={pixelInfo?.width ?? dimensions.width}
            pixelSize={5}
            gap={8}
            showOutline={true}
            isTree={appSettings.elementType === "tree"}
            setPixels={(newPixels: Uint8ClampedArray) => {
              console.log("Updating pixels from PixelDisplay component");
              setPixels(newPixels);
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default App;
