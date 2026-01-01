import { Button, Card, CardFooter, Spinner, Textarea } from "@heroui/react";
import { createRef, FC, use, useEffect, useMemo, useState } from "react";
import ReasoningViewer from "./ReasoningViewer";

const Prompt: FC<{
  image?: string;
  setImage: React.Dispatch<React.SetStateAction<string>>;
}> = ({ image, setImage }) => {
  const [prompt, setPrompt] = useState<string>("");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [responseID, setResponseID] = useState<string | null>(null);
  const [reasoningSummary, setReasoningSummary] = useState<string>("");
  const reasoningViewerRef = createRef<HTMLDivElement>();
  const [status, setStatus] = useState<string>("");

  const canRemix = useMemo(() => {
    return responseID !== null || image !== undefined;
  }, [responseID, image]);

  console.log("Current image:", image?.substring(0, 30) + "...");

  const generateImage = (remixOptions?: {
    responseIDInput?: string;
    imageInput?: string;
  }) => {
    setIsRunning(true);
    setReasoningSummary("");
    setStatus("Starting...");
    window.aiAPI
      .runPrompt(prompt, remixOptions)
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

    const handleStatusUpdate = (data: { status: string }) => {
      console.log("Status update:", data.status);
      setStatus(data.status);
    };

    window.aiAPI.onStatusUpdate(handleStatusUpdate);
    window.aiAPI.onReasoningSummaryDelta(handleReasoningSummaryDelta);
    window.aiAPI.onResponseImage(handleResponseImage);
    window.aiAPI.onResponseCompleted(handleResponseCompleted);
  }, []);

  useEffect(() => {
    if (reasoningViewerRef.current) {
      // scroll to bottom unless user has scrolled up more than 50px
      const el = reasoningViewerRef.current;
      if (el) {
        const { scrollTop, scrollHeight, clientHeight } = el;
        const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
        if (distanceFromBottom <= 50) {
          el.scrollTop = scrollHeight;
        }
      }
    }
  }, [reasoningSummary, reasoningViewerRef]);

  return (
    <div className="w-full p-4 rounded-md shadow-md">
      <div className="w-full flex items-start justify-center gap-4 flex-row">
        <Card className="w-90 mb-4 p-4 dark:shadow-lg min-w-1/2 max-h-[300px]">
          <Textarea
            disableAnimation={true}
            minRows={5}
            isClearable={true}
            value={prompt}
            onValueChange={setPrompt}
            placeholder={
              canRemix
                ? "Enter prompt to remix or generate the image...\n(Enter to remix)\n(Shift + Enter for new line)\n(Escape to clear)"
                : "Enter prompt to generate an image...\n(Enter to generate)\n(Shift + Enter for new line)\n(Escape to clear)"
            }
            onKeyDown={
              // if enter key use generate or remix
              (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  generateImage({
                    responseIDInput: responseID,
                    imageInput: image,
                  });
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
              {canRemix && (
                <Button
                  color="secondary"
                  size="sm"
                  onPress={async () => {
                    generateImage({
                      responseIDInput: responseID,
                      imageInput: image,
                    });
                  }}
                >
                  Remix
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              {isRunning && (
                <div className="text-sm text-gray-500">{status}</div>
              )}
              <Spinner hidden={!isRunning} size="sm" />
            </div>
          </CardFooter>
        </Card>
        {reasoningSummary && reasoningSummary.length > 0 && (
          <Card
            ref={reasoningViewerRef}
            className="w-90 mb-4 p-4 dark:shadow-lg max-w-1/2 max-h-[300px] overflow-y-auto"
          >
            <ReasoningViewer reasoningSummary={reasoningSummary} />
          </Card>
        )}
      </div>
    </div>
  );
};

export default Prompt;
