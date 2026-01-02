import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Navbar,
  NavbarContent,
  NavbarItem,
  Tooltip,
  type Selection,
} from "@heroui/react";
import {
  FC,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  useState,
  KeyboardEvent,
  useEffect,
} from "react";
import { CautionIcon, ClearIcon, CopyIcon, DownloadIcon, OpenIcon, SettingsIcon } from "../assets/icons/MenuBar";
import { Warning } from "postcss/lib/postcss";

type AppNavBarProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  actions?: {
    download: (showToast?: boolean) => Promise<string>;
    copyToXlights: () => Promise<void>;
    openExistingImage: () => Promise<void>;
    clearImage: () => void;
  };
};

const AppNavBar: FC<AppNavBarProps> = ({
  settings,
  setSettings,
  actions,
}: AppNavBarProps) => {
  const [tempRows, setTempRows] = useState<string>(
    (settings.dimensions.height || 50).toString()
  );
  const [tempColumns, setTempColumns] = useState<string>(
    (settings.dimensions.width || 16).toString()
  );
  const setSettingsWithDimensions = (
    value: string,
    dimension: "height" | "width"
  ) => {
    const newInt = parseInt(value, 10);
    setSettings({
      ...settings,
      dimensions: { ...settings.dimensions, [dimension]: newInt },
    });
    localStorage.setItem(
      dimension === "height" ? "rows" : "columns",
      newInt.toString()
    );
  };
  const [elementType, setElementType] = useState<Selection>(
    new Set([localStorage.getItem("elementType") || "tree"])
  );

  useEffect(() => {
    const type = Array.from(elementType)[0] || "tree";
    localStorage.setItem("elementType", type as string);
    setSettings((prev) => ({
      ...prev,
      elementType: type as "tree" | "matrix",
    }));
  }, [elementType]);

  const maskNames = (name: string) => {
    if (!window.globalSettings?.maskNames) {
      return name;
    }
    // remove chfields or Dropbox and replace with ****
    return name.replace(/chfields|Dropbox/gi, "****");
  };

  return (
    <Navbar isBlurred isBordered position="sticky" maxWidth="full">
      <NavbarContent justify="start">
        <NavbarItem>
          {" "}
          <Button
            variant="faded"
            className="underline text-blue-400 min-h-[48px]"
            onPress={async () => {
              const directories = await window.fileAPI.selectDirectory();
              if (directories.length > 0) {
                setSettings((prev: AppSettings) => ({
                  ...prev,
                  directory: directories[0],
                }));
                localStorage.setItem("currentDirectory", directories[0]);
              }
            }}
          >
            {settings.directory
              ? `Directory: ${maskNames(settings.directory)}`
              : "Select Directory"}
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Input
            size="sm"
            label="Rows"
            type="number"
            className="min-w-[80px]"
            value={tempRows}
            onValueChange={(value: string) => setTempRows(value)}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              setSettingsWithDimensions(e.target.value, "height");
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key == "Enter") {
                setSettingsWithDimensions(tempRows, "height");
              }
            }}
          />
        </NavbarItem>
        <NavbarItem>
          <Input
            size="sm"
            label="Columns"
            type="number"
            className="min-w-[80px]"
            value={tempColumns}
            onValueChange={(value: string) => setTempColumns(value)}
            onBlur={(e: ChangeEvent<HTMLInputElement>) => {
              setSettingsWithDimensions(e.target.value, "width");
            }}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
              if (e.key == "Enter") {
                setSettingsWithDimensions(tempColumns, "width");
              }
            }}
          />
        </NavbarItem>
        <Dropdown disableAnimation={true}>
          <NavbarItem>
            <DropdownTrigger>
              <Button disableRipple variant="faded" className="min-h-[48px]">
                Element:{" "}
                {Array.from(elementType)
                  .join(", ")
                  .replace(/^\w/, (c) => c.toUpperCase())}
              </Button>
            </DropdownTrigger>
          </NavbarItem>
          <DropdownMenu
            selectedKeys={elementType}
            onSelectionChange={setElementType}
            selectionMode="single"
          >
            <DropdownItem key={"tree"}>Tree</DropdownItem>
            <DropdownItem key={"matrix"}>Matrix</DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            variant="faded"
            color="primary"
            className="min-h-[48px] text-xs"
            onPress={() => {
              actions?.openExistingImage();
            }}
          >
            <OpenIcon width="16px" height="16px"  /> Open Existing Image
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="faded"
            color="primary"
            className="min-h-[48px] text-xs"
            onPress={() => {
              actions?.download();
            }}
          >
            <DownloadIcon width="16px" height="16px"  /> Save PNG
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Button
            variant="faded"
            color="primary"
            className="min-h-[48px] text-xs"
            onPress={() => {
              actions?.copyToXlights();
            }}
          >
            <CopyIcon width="16px" height="16px"  /> Copy to xLights
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Tooltip
            content="Clear the current image from the app. This action cannot be undone."
            disableAnimation
            color="danger"
            delay={1000}
            className="max-w-[200px]"
          >
            <Button
              variant="bordered"
              color="danger"
              className="min-h-[48px]"
              isIconOnly
              onPress={() => {
                actions?.clearImage();
              }}
            >
              <ClearIcon width="24px" height="24px"  />
            </Button>
          </Tooltip>
        </NavbarItem>
        <NavbarItem>
          <Tooltip
            color="warning"
            className="max-w-[200px]"
            disableAnimation
            content="Settings - Warning: Missing or incorrect settings may cause the app to malfunction."
          >
            <Button
              variant="bordered"
              color="warning"
              className="min-h-[48px]"
              title="Settings"
              endContent={
                <div className="m-1">
                  <CautionIcon width="16px" height="16px" />
                </div>
              }
            >
              <SettingsIcon width="24px" height="24px" fill="currentColor" />
            </Button>
          </Tooltip>
        </NavbarItem>
      </NavbarContent>
    </Navbar>
  );
};

export default AppNavBar;
