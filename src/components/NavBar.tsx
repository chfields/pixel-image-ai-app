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

type AppNavBarProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
  actions?: {
    download: () => Promise<void>;
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

  return (
    <Navbar isBlurred isBordered className="w-full justify-start">
      <NavbarContent>
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
              ? `Directory: ${settings.directory}`
              : "Select Directory"}
          </Button>
        </NavbarItem>
        <NavbarItem>
          <Input
            size="sm"
            label="Rows"
            type="number"
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
        <NavbarItem>
          <Button
            variant="solid"
            color="primary"
            className="min-h-[48px]"
            onPress={() => {
              actions?.download();
            }}
          >
            Save PNG
          </Button>
        </NavbarItem>

      </NavbarContent>
    </Navbar>
  );
};

export default AppNavBar;
