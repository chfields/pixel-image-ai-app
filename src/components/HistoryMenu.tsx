import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  NavbarItem,
  Selection,
  Spinner,
  Tooltip,
} from "@heroui/react";
import { HistoryMenuIcon } from "../assets/icons/MenuBar";
import { useEffect, useState } from "react";

const HistoryMenu = (props: {
  width?: string;
  height?: string;
  directoryPath?: string;
  onSelectItem: (item: InteractionRecord) => void;
}) => {
  const [historyRecords, setHistoryRecords] = useState<InteractionRecord[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    let mounted = true;
    setIsLoading(true);
    window.historyAPI
      .getInteractions(props.directoryPath || "", 20)
      .then((records: InteractionRecord[]) => {
        if (mounted) setHistoryRecords(records);
      })
      .catch(() => {
        if (mounted) setHistoryRecords([]);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [props.directoryPath, isOpen]);

  return (
    <Dropdown disableAnimation={true} isOpen={isOpen} onOpenChange={setIsOpen}>
      <NavbarItem>
        <DropdownTrigger>
          <Button
            isIconOnly
            disableRipple
            variant="faded"
            className="min-h-[48px]"
          >
            <HistoryMenuIcon
              width={props.width || "24px"}
              height={props.height || "24px"}
              fill="#006Fee"
            />
          </Button>
        </DropdownTrigger>
      </NavbarItem>
      <DropdownMenu
        onSelectionChange={(newSelection: Selection) => {
          // get interaction record by id
          const selectedId = Array.from(newSelection)[0];
          const selectedRecord = historyRecords.find(
            (rec) => rec.id === selectedId
          );
          if (selectedRecord) {
            props.onSelectItem(selectedRecord);
          }
        }}
        selectionMode="single"
        className="max-h-250 overflow-y-auto w-96"
      >
        {isLoading ? (
          <DropdownItem key="loading">
            <Spinner size="sm" className="m-4" />
          </DropdownItem>
        ) : historyRecords.length === 0 ? (
          <DropdownItem key="empty">No history</DropdownItem>
        ) : (
          historyRecords.map((rec, idx) => (
            <DropdownItem key={(rec as InteractionRecord).id ?? idx}>
              <div className="flex flex-row items-center gap-2">
                {rec.image ? (
                  <img
                    src={`data:image/png;base64,${rec.image}`}
                    alt="history-image"
                    width={64}
                    height={64}
                  />
                ) : (
                  <div className="w-[64px] h-[64px] bg-gray-700 flex items-center justify-center text-gray-500 text-xs min-w-[64px]">
                    No Image
                  </div>
                )}
                <div className="flex flex-col">
                  <div className="flex-1 truncate">{rec.prompt}</div>
                  <span className="text-xs text-gray-500">
                    {new Date(rec.timestamp).toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500">
                    Engine: {rec.engineName}
                  </span>
                  <span className="text-xs text-gray-500">
                    Model: {rec.modelName || ""}
                  </span>
                  {rec.error && (<div className="text-xs text-red-500">Error: {rec.error}</div>)}
                </div>
              </div>
            </DropdownItem>
          ))
        )}
      </DropdownMenu>
    </Dropdown>
  );
};

export default HistoryMenu;
