import { addToast, Button, Card } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useCallback, useEffect, useMemo, useState } from "react";
import PreviewImage from "../components/PreviewImage";
import PixelDisplay from "../components/PixelDisplay";
import AppNavBar from "../components/NavBar";
import { App } from "electron";

const App: React.FC = () => {
  const [image, setImage] = useState<string>(() => {
    return localStorage.getItem("generatedImage") || "";
  });
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings>(() => {
    const savedDirectory = localStorage.getItem("currentDirectory");
    return {
      directory: savedDirectory || "",
      dimensions: {
        width: parseInt(localStorage.getItem("columns") || "16", 10),
        height: parseInt(localStorage.getItem("rows") || "50", 10),
      },
    };
  });
  const [xOffset, setXOffset] = useState<number>(0);
  const [yOffset, setYOffset] = useState<number>(0);

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

  const downloadEditedImage = useCallback(
    async (showToast = true) => {
      const png = await window.imageAPI.fromPixels(pixels, {
        width: pixelInfo?.width,
        height: pixelInfo?.height,
        channels: pixelInfo?.channels,
      });
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
      // replace home directory with ~ for display
      const maskedPath = finalPath.replace(window.envVars.homeDir || "", "~");
      if (showToast) {
        addToast({
          color: "success",
          title: "Image Saved",
          description: `Image saved as ${maskedPath}`,
          classNames: {
            base: "flex flex-col items-start",
          },
          endContent: (
            <div className="ms-11 my-2 flex gap-x-2">
              <Button
                color={"success"}
                size="sm"
                variant="bordered"
                onPress={() => {
                  window.fileAPI.showFolder(finalPath);
                }}
              >
                View Image
              </Button>
              <Button
                color={"success"}
                size="sm"
                variant="bordered"
                onPress={() => {
                  window.fileAPI.showFolder(`${appSettings?.directory}/images`);
                }}
              >
                View Folder
              </Button>
            </div>
          ),
        });
      }
      return finalPath;
    },
    [pixels, pixelInfo, appSettings]
  );

  const copyToXlights = useCallback(async () => {
    if (!pixels || !pixelInfo) {
      alert("No pixel data to copy.");
      return;
    }
    // print out what is currently in cli
    const cliText = await window.clipboardAPI.readText();
    console.log("Current clipboard text:", cliText);

    const downloadedImagePath = await downloadEditedImage(false);
    if (!downloadedImagePath) {
      return;
    }
    // text for clipboard
    const textForClipboard = `CopyFormat1	0	1	2	0	-1	NO_PASTE_BY_CELL
Pictures	E_CHECKBOX_Pictures_PixelOffsets=0,E_CHECKBOX_Pictures_Shimmer=0,E_CHECKBOX_Pictures_TransparentBlack=0,E_CHECKBOX_Pictures_WrapX=0,E_CHOICE_Pictures_Direction=none,E_CHOICE_Scaling=No Scaling,E_FILEPICKER_Pictures_Filename=${downloadedImagePath},E_SLIDER_PicturesXC=${xOffset},E_SLIDER_PicturesYC=${yOffset},E_SLIDER_Pictures_EndScale=100,E_SLIDER_Pictures_StartScale=100,E_TEXTCTRL_Pictures_FrameRateAdj=1.0,E_TEXTCTRL_Pictures_Speed=1.0,E_TEXTCTRL_Pictures_TransparentBlack=0	C_BUTTON_Palette1=#FFFFFF,C_BUTTON_Palette2=#FF0000,C_BUTTON_Palette3=#00FF00,C_BUTTON_Palette4=#0000FF,C_BUTTON_Palette5=#FFFF00,C_BUTTON_Palette6=#FB6906,C_BUTTON_Palette7=#326D6D,C_BUTTON_Palette8=#FF00FF	0	2000	4	-1000	NO_PASTE_BY_CELL
`;

    const clipboardText = await window.clipboardAPI.writeText(textForClipboard);
    addToast({
      color: "success",
      title: "Copied to Clipboard",
      description: `Image data copied to clipboard for xLights.`,
    });
    console.log("Clipboard text:", clipboardText);
  }, [pixels, pixelInfo, xOffset, yOffset, downloadEditedImage]);

  const dimensions = useMemo(() => {
    return appSettings.dimensions;
  }, [appSettings]);

  return (
    <div className="w-full">
      <AppNavBar
        settings={appSettings}
        setSettings={setAppSettings}
        actions={{
          download: downloadEditedImage,
          copyToXlights: copyToXlights,
        }}
      />
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} image={image} />
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
            setOffsets={(xOffset: number, yOffset: number) => {
              console.log(
                `Offsets updated: xOffset=${xOffset}, yOffset=${yOffset}`
              );
              setXOffset(xOffset);
              setYOffset(yOffset);
            }}
          />
        </Card>
      </div>
    </div>
  );
};

export default App;
