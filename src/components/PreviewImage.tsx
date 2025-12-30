import { FC, useEffect, useState } from "react";

const PreviewImage: FC<{ image: string }> = ({ image }) => {
  const [currentImage, setCurrentImage] = useState<string>(() => {
    return localStorage.getItem("generatedImage") || "";
  });

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

  return (
    <div className="w-full flex items-center justify-center mt-4">
      {currentImage ? (
        <img
          src={`data:image/png;base64,${currentImage}`}
          alt="Generated"
          className="max-w-full h-auto rounded-md shadow-md"
        />
      ) : (
        <p>No image generated yet.</p>
      )}
    </div>
  );
};

export default PreviewImage;
