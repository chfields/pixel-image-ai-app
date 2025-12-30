import { FC, useEffect, useState, useMemo } from "react";
import Cropper from "react-easy-crop";

const DEFAULT_WIDTH = 16;
const DEFAULT_HEIGHT = 50;

const PreviewImage: FC<{ image: string; width: number; height: number; setSizedImage: (image: string) => void }> = ({
  image,
  width,
  height,
  setSizedImage,
}) => {
  const [currentImage, setCurrentImage] = useState<string>(() => {
    return localStorage.getItem("generatedImage") || "";
  });
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const aspect = useMemo(() => {
    if (width && height) {
      return width / height;
    }
    return DEFAULT_WIDTH / DEFAULT_HEIGHT;
  }, [width, height]);

  useEffect(() => {
    if (!image) return;
    localStorage.setItem("generatedImage", image);
    setCurrentImage(image);
  }, [image]);

  useEffect(() => {
    const savedImage = localStorage.getItem("generatedImage");
    if (savedImage) {
      setCurrentImage(savedImage);
    }
  }, []);

  const onCropAreaChange = (croppedArea: CropArea, croppedAreaPixels: CropArea) => {
    // You can use croppedAreaPixels to get the cropped area in pixels
    // console.log(croppedAreaPixels);
    window.imageAPI
      .processImage(
        currentImage,
        width || DEFAULT_WIDTH,
        height || DEFAULT_HEIGHT,
        (croppedAreaPixels.x / (croppedAreaPixels.width + croppedAreaPixels.x)) * 100,
        (croppedAreaPixels.y / (croppedAreaPixels.height + croppedAreaPixels.y)) * 100
      )
      .then((processedImage: string) => {
        setSizedImage(processedImage);
      });
  };

  return (
    <div className="flex flex-row w-full items-center justify-center relative h-[300px] w-[100px] bg-gray-200 dark:bg-gray-800 border border-gray-400 dark:border-gray-600">
      <Cropper
        image={`data:image/png;base64,${currentImage}`}
        crop={crop}
        rotation={0}
        zoom={zoom}
        onCropChange={setCrop}
        onZoomChange={setZoom}
        minZoom={0.05}
        aspect={aspect}
        cropShape="rect"
        restrictPosition={true}
        onCropComplete={onCropAreaChange}
        classes={{
          mediaClassName: "border border-gray-700",
        }}
        // objectFit="contain"
        showGrid={true}
      />
    </div>
  );
};

export default PreviewImage;
