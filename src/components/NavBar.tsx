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
  ChangeEvent,
  useState,
  KeyboardEvent,
  useEffect,
} from "react";
import {
  CautionIcon,
  ClearIcon,
  CopyIcon,
  DownloadIcon,
  OpenIcon,
  SettingsIcon,
} from "../assets/icons/MenuBar";

type AppNavBarProps = {
  settings: AppSettings;
  onSettingsChange: (newSettings: AppSettings) => void; 
  validSettings: Promise<boolean>;
  actions?: {
    download: (showToast?: boolean) => Promise<string>;
    copyToXlights: () => Promise<void>;
    openExistingImage: () => Promise<void>;
    clearImage: () => void;
    openSettings: () => void;
  };
};

const AppNavBar: FC<AppNavBarProps> = ({
  settings,
  onSettingsChange,
  validSettings,
  actions,
}: AppNavBarProps) => {
  const [tempRows, setTempRows] = useState<string>(
    (settings?.dimensions?.height || 50).toString()
  );
  const [tempColumns, setTempColumns] = useState<string>(
    (settings?.dimensions?.width || 16).toString()
  );
  const setSettingsWithDimensions = (
    value: string,
    dimension: "height" | "width"
  ) => {
    const newInt = parseInt(value, 10);
    onSettingsChange({
      ...settings,
      dimensions: { ...settings?.dimensions, [dimension]: newInt },
    });
  };
  const [elementType, setElementType] = useState<Selection>(
    new Set([settings?.elementType])
  );
  const [hasValidSettings, setHasValidSettings] = useState<boolean>(false);

  useEffect(() => {
    const checkValidSettings = async () => {
      const isValid = await validSettings;
      setHasValidSettings(isValid);
      console.log("Settings valid:", isValid);
    };
    checkValidSettings();
  }, [validSettings]);

  useEffect(() => {
    setTempRows((settings?.dimensions?.height || 50).toString());
    setTempColumns((settings?.dimensions?.width || 16).toString());
    setElementType(new Set([settings?.elementType]));
  }, [settings]);

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
          <Button
            variant={!(settings?.directory || null) ? "bordered" : "faded"}
            color={"primary"}
            className={`underline text-primary min-h-[48px]`}
            onPress={async () => {
              const directories = await window.fileAPI.selectDirectory();
              if (directories.length > 0) {
                const selectedDirectory = directories[0];
                onSettingsChange({
                  ...settings,
                  directory: selectedDirectory,
                });
              }
            }}
          >
            {settings?.directory
              ? `Directory: ${maskNames(settings.directory)}`
              : "Select Directory"}
            {!(settings?.directory || null) && <CautionIcon color="#FFA500" width="16px" height="16px" />}
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Input
            size="sm"
            label="Rows"
            type="number"
            className="max-w-[90px] min-w-[90px]"
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
            className="max-w-[90px] min-w-[90px]"
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
            onSelectionChange={(newSelection: Selection) => {
              if (!settings) return;
              setElementType(newSelection);
              const selectedElement =
                Array.from(newSelection)[0] || "tree";
              onSettingsChange({
                ...settings,
                elementType: selectedElement as "tree" | "matrix",
              });
            }}  
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
            <OpenIcon width="16px" height="16px" /> Open Existing Image
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
            <DownloadIcon width="16px" height="16px" /> Save PNG
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
            <CopyIcon width="16px" height="16px" /> Copy to xLights
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
              <ClearIcon width="24px" height="24px" />
            </Button>
          </Tooltip>
        </NavbarItem>
        <NavbarItem>
          <Tooltip
            color={hasValidSettings ? "primary" : "warning"}
            className="max-w-[200px]"
            disableAnimation
            content={
              hasValidSettings
                ? "Settings are valid."
                : "Settings - Warning: Missing or incorrect settings may cause the app to malfunction."
            }
            delay={1000}
          >
            <Button
              variant="bordered"
              color={ "primary" }
              className="min-h-[48px]"
              title="Settings"
              onPress={() => {
                actions?.openSettings();
              }}
              endContent={
                !hasValidSettings &&
                <div className="m-1">
                  <CautionIcon color="#FFA500" width="16px" height="16px" />
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
