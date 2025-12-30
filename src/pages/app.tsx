import { Button } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useEffect, useState } from "react";
import PreviewImage from "../components/PreviewImage";

const App: React.FC = () => {
  const [image, setImage] = useState<string>("");
  const [sizedImage, setSizedImage] = useState<string>("");
  const [pixels, setPixels] = useState<Uint8ClampedArray | null>(null);
  const [pixelInfo, setPixelInfo] = useState<{ width: number; height: number; channels: number } | null>(null); 

  useEffect(() => {
    if (!sizedImage) return;
    window.imageAPI.toPixels(sizedImage).then((pixelData: { data: Buffer; info: { width: number; height: number; channels: number } }) => {
      const pixelArray = new Uint8ClampedArray(pixelData.data.buffer);
      setPixels(pixelArray);
      setPixelInfo(pixelData.info);
      console.log("Pixel data:", pixelData);
    });

  }, [sizedImage]);
  return (
    <div>
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} />
      </div>
      <PreviewImage image={image} width={16} height={50} setSizedImage={setSizedImage} />
    </div>
  );
};

export default App;
