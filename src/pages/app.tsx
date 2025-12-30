import { Button } from "@heroui/react";
import Prompt from "../components/Prompt";
import { useState } from "react";
import PreviewImage from "../components/PreviewImage";

const App: React.FC = () => {
  const [image, setImage] = useState<string>("");
  return (
    <div>
      <div className="w-full flex items-center justify-center">
        <Prompt setImage={setImage} />
      </div>
      <PreviewImage image={image} />
    </div>
  );
};

export default App;
