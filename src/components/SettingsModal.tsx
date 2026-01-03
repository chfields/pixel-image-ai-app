import {
  Button,
  Card,
  Divider,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  Selection,
  SelectItem,
  Input,
} from "@heroui/react";
import { FC, useEffect, useState } from "react";

type SettingsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onChangeSettings: (appSettings: AppSettings) => void;
  currentSettings: AppSettings;
};

const SettingsModal: FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onChangeSettings,
  currentSettings,
}) => {
  const [modelEngineSelection, setModelEngineSelection] = useState<Selection>(
    new Set(
      currentSettings?.modelEngine ? [currentSettings.modelEngine] : ["openai"]
    )
  );
  const [modelName, setModelName] = useState<string | undefined>(
    currentSettings?.model
  );

  const getApiKeyForEngine = async (engine: string): Promise<string> => {
    const apiKey = await window.secureApiKeyStorage.getApiKey(engine);
    return apiKey || "";
  };

  const [tempApiKey, setTempApiKey] = useState<string>("");

  useEffect(() => {
    const fetchApiKey = async () => {
      const modelEngine = currentSettings?.modelEngine || "openai";
      if (modelEngine) {
        const apiKey = await getApiKeyForEngine(modelEngine);
        console.log("Fetched API Key for engine:", modelEngine);
        setTempApiKey(apiKey);
        setModelName(currentSettings?.model || "gpt-5.2");
      }
    };
    if (isOpen) {
      fetchApiKey();
    }
  }, [currentSettings, isOpen]);

  const setApiKeyForEngine = async (
    engine: string,
    apiKey: string
  ): Promise<void> => {
    await window.secureApiKeyStorage.saveApiKey(engine, apiKey);
  };

  const clearApiKeyForEngine = async (engine: string): Promise<void> => {
    await window.secureApiKeyStorage.deleteApiKey(engine);
  };

  return (
    <div>
      {isOpen && (
        <Modal
          disableAnimation
          className="p-4"
          size="5xl"
          onClose={onClose}
          isOpen={isOpen}
          onOpenChange={(isOpen: boolean) => {
            if (!isOpen) {
              onClose();
            }
          }}
          title="Settings"
        >
          <ModalContent>
            <ModalHeader className="flex flex-col">
              Settings
              <Divider className="my-2" />
            </ModalHeader>
            <ModalBody>
              <Card className="p-4 mb-4">
                <div className="flex flex-col max-w-md">
                  <Select
                    label="Model Engine"
                    placeholder="Select Model Engine"
                    selectedKeys={modelEngineSelection}
                    onSelectionChange={(newSelection: Selection) => {
                      setModelEngineSelection(newSelection);
                      const selectedEngine =
                        Array.from(newSelection)[0] || "openai";
                      onChangeSettings({
                        ...currentSettings,
                        modelEngine: selectedEngine as string,
                      });
                    }}
                  >
                    <SelectItem key="openai">openai</SelectItem>
                  </Select>
                  <Input
                    disableAnimation
                    className="mt-4"
                    label="API Key"
                    placeholder="Enter your API Key"
                    type="password"
                    value={tempApiKey}
                    isClearable
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setApiKeyForEngine(
                        (Array.from(modelEngineSelection)[0] as string) ||
                          "openai",
                        e.target.value
                      );
                      setTempApiKey(e.target.value);
                    }}
                    onClear={() => {
                      clearApiKeyForEngine(
                        (Array.from(modelEngineSelection)[0] as string) ||
                          "openai"
                      );
                      setTempApiKey("");
                    }}
                  />
                  <Input
                    disableAnimation
                    isClearable
                    label="Model Name (optional)"
                    placeholder="e.g., gpt-4o, gpt-5.2"
                    value={modelName}
                    className="mt-4"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      setModelName(e.target.value);
                    }}
                    onClear={() => {
                      setModelName(undefined);
                    }}
                  />
                </div>
              </Card>
            </ModalBody>
            <ModalFooter>
              <Button
                color="primary"
                onPress={() => {
                  const newSettings = currentSettings;
                  // add engine if not present
                  if (!newSettings.modelEngine) {
                    newSettings.modelEngine =
                      (Array.from(modelEngineSelection)[0] as string) ||
                      "openai";
                  }
                  onChangeSettings({
                    ...newSettings,
                    model: modelName,
                  });
                  onClose();
                }}
              >
                Save Settings
              </Button>
              <Button
                onPress={() => {
                  onClose();
                }}
              >
                Cancel
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default SettingsModal;
