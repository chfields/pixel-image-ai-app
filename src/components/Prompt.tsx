import { Card, Textarea } from "@heroui/react";

const Prompt: React.FC = () => {
  return (
    <div className="w-full p-4 rounded-md shadow-md">
      <div className="w-full flex items-center justify-center">
        <Card className="w-90 mb-4 p-4 dark:shadow-lg">
          <Textarea
            placeholder="Enter your prompt here..."
          />
        </Card>
      </div>
    </div>
  );
};

export default Prompt;
