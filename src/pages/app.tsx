import { addToast, Button, Card, ToastVariantProps } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useCallback, useEffect, useMemo, useState } from "react";
import PreviewImage from "../components/PreviewImage";
import PixelDisplay from "../components/PixelDisplay";
import AppNavBar from "../components/NavBar";
import { App } from "electron";
import SettingsModal from "../components/SettingsModal";

const App: React.FC = () => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] =
    useState<boolean>(false);
  const [image, setImage] = useState<string | null>(() => {
    return localStorage.getItem("generatedImage") || null;
  });
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [appSettings, setAppSettings] = useState<AppSettings | undefined>(undefined);
  const [xOffset, setXOffset] = useState<number>(0);
  const [yOffset, setYOffset] = useState<number>(0);

  const [pixelInfo, setPixelInfo] = useState<{
    width: number;
    height: number;
    channels: number;
  } | null>(null);

  window.globalSettings = {
    maskNames: true,
  };

  const loadSettings = useCallback(async () => {
    const savedSettings = await window.appSettingsAPI.getSettings();
    if (savedSettings) {
      console.log("Loaded saved settings:", savedSettings);
      setAppSettings(savedSettings);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const validSettings = useMemo(async () => {
    const engine = appSettings?.modelEngine;
    console.log("Validating settings for engine:", engine);
    if (!engine) {
      return false;
    }
    const apiKey = await window.secureApiKeyStorage.getApiKey(engine);
    if (!apiKey) {
      return false;
    }

    return true;
  }, [appSettings]);

  const validPixels = useMemo(() => {
    return (
      pixels &&
      pixelInfo &&
      pixels.length === pixelInfo.width * pixelInfo.height * pixelInfo.channels
    );
  }, [pixels, pixelInfo]);

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
      if (!validPixels) {
        alert("No valid pixel data to save.");
        return;
      }
      const png = await window.imageAPI.fromPixels(pixels, {
        width: pixelInfo?.width,
        height: pixelInfo?.height,
        channels: pixelInfo?.channels,
      });
      if (!appSettings?.directory) {
        alert("Please select a directory first.");
        return;
      }
      // path seperator based on OS
      const pathSep = window.envVars.platform === "win32" ? "\\" : "/";

      // name should be last part of path + elementtype + index + .png
      const lastofPath = appSettings.directory.split(pathSep).pop() || "image";
      const fileName = `${lastofPath}_${appSettings.elementType || "image"}.png`;
      const finalPath = await window.fileAPI.writeFileFromBase64(
        `${appSettings?.directory}${pathSep}images`,
        fileName,
        png
      );
      // save source image as well
      await window.fileAPI.writeFileFromBase64(
        `${appSettings?.directory}${pathSep}images`,
        `${lastofPath}_${appSettings.elementType}_source.png`,
        image
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
                  window.fileAPI.showFolder(`${appSettings?.directory}${pathSep}images`);
                }}
              >
                View Folder
              </Button>
            </div>
          ),
        } as ToastVariantProps);
      }
      return finalPath;
    },
    [pixels, pixelInfo, appSettings]
  );

  const selectHistoryItem = useCallback(async (item: InteractionRecord) => {
    console.log("Selected history item:", item);
    if (item && item.image) {
      setImage(item.image);
    }
  }, []);

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
    } as any);
    console.log("Clipboard text:", clipboardText);
  }, [pixels, pixelInfo, xOffset, yOffset, downloadEditedImage]);

  const dimensions = useMemo(() => {
    return appSettings?.dimensions || { width: 16, height: 50 };
  }, [appSettings]);

  const openexistingImage = useCallback(async () => {
    const fileContent = await window.fileAPI.readFile(undefined);
    if (fileContent) {
      setImage(fileContent);
      localStorage.setItem("generatedImage", fileContent);
    }
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const clearImage = useCallback(() => {
    setImage(null);
    setSizedImage("");
    setPixels(null);
    setPixelInfo(null);
    localStorage.removeItem("generatedImage");
  }, [setImage, setSizedImage, setPixels, setPixelInfo]);

  const saveSettings = useCallback((newSettings: AppSettings) => {
    if (!newSettings) return;
    console.log("Saving settings:", newSettings);
    setAppSettings(newSettings);
    window.appSettingsAPI.saveSettings(newSettings);
  }, []);

  useEffect(() => {
    // image updated
    if (image) {
      localStorage.setItem("generatedImage", image);
      console.log("Image updated, resizing to dimensions:", dimensions);
    }
  }, [image]);


  return (
    <div className="w-full">
      <AppNavBar
        settings={appSettings}
        onSettingsChange={(newSettings: AppSettings) => {
          saveSettings(newSettings);
        }}
        validSettings={validSettings}
        actions={{
          download: downloadEditedImage,
          copyToXlights: copyToXlights,
          openExistingImage: openexistingImage,
          clearImage,
          openSettings,
          selectHistoryItem,
        }}
      />
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onChangeSettings={(newSettings) => {
          saveSettings(newSettings);
        }}
        currentSettings={appSettings}
      />
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} image={image} settings={appSettings} />
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
            pixelHeight={dimensions.height || 50}
            pixelWidth={dimensions.width || 16}
            width={pixelInfo?.width ?? dimensions.width}
            pixelSize={5}
            gap={8}
            showOutline={true}
            isTree={appSettings?.elementType === "tree"}
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
