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
import { FC, useEffect, useMemo, useState } from "react";

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
  const [availableEngines, setAvailableEngines] = useState<
    { name: string; label: string }[]
  >([]);

  const getApiKeyForEngine = async (engine: string): Promise<string> => {
    const apiKey = await window.secureApiKeyStorage.getApiKey(engine);
    return apiKey || "";
  };

  const [tempApiKey, setTempApiKey] = useState<string>("");

  const loadEngines = async () => {
    const engines = await window.aiAPI.getAvailableEngines();
    setAvailableEngines(engines);
  };

  useEffect(() => {
    loadEngines();
  }, []);

  useEffect(() => {
    const fetchApiKey = async () => {
      const modelEngine = currentSettings?.modelEngine || "openai";
      if (modelEngine) {
        const apiKey = await getApiKeyForEngine(modelEngine);
        console.log("Fetched API Key for engine:", modelEngine);
        setTempApiKey(apiKey);
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

  const currentEngine = useMemo(() => {
    return (Array.from(modelEngineSelection)[0] as string) || "openai";
  }, [modelEngineSelection]);

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
                    disableAnimation
                    label="Model Engine"
                    placeholder="Select Model Engine"
                    selectedKeys={modelEngineSelection}
                    onSelectionChange={(newSelection: Selection) => {
                      setModelEngineSelection(newSelection);
                      const selectedEngine = (Array.from(newSelection)[0] ||
                        "openai") as string;
                      const engineSettings =
                        typeof currentSettings?.[selectedEngine] === "object"
                          ? (currentSettings?.[selectedEngine] as {
                              model?: string;
                            })
                          : { model: undefined };
                      onChangeSettings({
                        ...currentSettings,
                        modelEngine: selectedEngine,
                        [selectedEngine]: engineSettings,
                      } as AppSettings);
                    }}
                  >
                    {availableEngines.map((engine) => (
                      <SelectItem key={engine.name}>{engine.label}</SelectItem>
                    ))}
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
                      setApiKeyForEngine(currentEngine, e.target.value);
                      setTempApiKey(e.target.value);
                    }}
                    onClear={() => {
                      clearApiKeyForEngine(currentEngine);
                      setTempApiKey("");
                    }}
                  />
                  <Input
                    disableAnimation
                    isClearable
                    label="Model Name (optional)"
                    placeholder="e.g., gpt-4o, gpt-5.2"
                    value={currentSettings?.[currentEngine]?.model || ""}
                    className="mt-4"
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                      onChangeSettings({
                        ...currentSettings,
                        [currentEngine]: {
                          model: e.target.value,
                        },
                      });
                    }}
                    onClear={() => {
                      onChangeSettings({
                        ...currentSettings,
                        [currentEngine]: {
                          model: undefined,
                        },
                      });
                    }}
                  />
                </div>
              </Card>
            </ModalBody>
            <ModalFooter>
              <Button
                onPress={() => {
                  onClose();
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
};

export default SettingsModal;
