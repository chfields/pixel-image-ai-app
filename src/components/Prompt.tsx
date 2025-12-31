import {
  Button,
  Card,
  CardFooter,
  image,
  Spinner,
  Textarea,
} from "@heroui/react";
import { FC, useEffect, useState } from "react";
import Reasoning from "./ReasoningViewer";
import ReasoningViewer from "./ReasoningViewer";

const Prompt: FC<{
  setImage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ setImage }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [responseID, setResponseID] = useState<string | null>(null);
  const [reasoningSummary, setReasoningSummary] = useState<string>("");

  const generateImage = (responseID?: string) => {
    setIsRunning(true);
    setReasoningSummary("");
    window.aiAPI
      .runPrompt(prompt, responseID)
      .then((data) => {
        console.log("File data:", data);
      })
      .finally(() => {
        setIsRunning(false);
      });
  };

  useEffect(() => {
    const handleResponseImage = (imageData: any) => {
      console.log("Received image data:", imageData);
      // Handle the received image data (e.g., display it in the UI)
      if (imageData) {
        setImage(imageData.result);
      }
    };

    const handleResponseCompleted = (data: { responseID: string }) => {
      console.log("Response completed with ID:", data.responseID);
      setResponseID(data.responseID);
      setIsRunning(false);
      // Handle the completion of the response if needed
    };

    const handleReasoningSummaryDelta = (data: any) => {
      console.log("Received reasoning summary delta:", data);
      setReasoningSummary((prev) => prev + data.delta);
    };

    window.aiAPI.onReasoningSummaryDelta(handleReasoningSummaryDelta);
    window.aiAPI.onResponseImage(handleResponseImage);
    window.aiAPI.onResponseCompleted(handleResponseCompleted);
  }, []);

  return (
    <div className="w-full p-4 rounded-md shadow-md">
      <div className="w-full flex items-start justify-center gap-4 flex-row">
        <Card className="w-90 mb-4 p-4 dark:shadow-lg min-w-1/2">
          <Textarea
            disableAnimation={true}
            minRows={5}
            isClearable={true}
            value={prompt}
            onValueChange={setPrompt}
            placeholder={
              responseID
                ? "Enter prompt to remix or generate the image...\n(Enter to remix)\n(Shift + Enter for new line)\n(Escape to clear)"
                : "Enter prompt to generate an image...\n(Enter to generate)\n(Shift + Enter for new line)\n(Escape to clear)"
            }
            onKeyDown={
              // if enter key use generate or remix
              (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateImage(responseID ?? undefined);
                }
                // escape key clears prompt
                if (e.key === "Escape") {
                  e.preventDefault();
                  setPrompt("");
                }
              }
            }
            onClear={() => setPrompt("")}
          />
          <CardFooter className="flex items-center justify-between">
            <div className="flex gap-2">
              <Button color="primary" size="sm" onPress={() => generateImage()}>
                Generate
              </Button>
              {responseID && (
                <Button
                  color="secondary"
                  size="sm"
                  onPress={async () => {
                    generateImage(responseID);
                  }}
                >
                  Remix
                </Button>
              )}
            </div>
            <Spinner hidden={!isRunning} size="sm" />
          </CardFooter>
        </Card>
        {reasoningSummary && reasoningSummary.length > 0 && (
          <Card className="w-90 mb-4 p-4 dark:shadow-lg max-w-1/2 max-h-[400px] overflow-y-auto">
            <ReasoningViewer reasoningSummary={reasoningSummary} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prompt;
