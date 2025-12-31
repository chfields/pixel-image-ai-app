import {
  Button,
  Input,
  Navbar,
  NavbarContent,
  NavbarItem,
} from "@heroui/react";
import {
  FC,
  Dispatch,
  SetStateAction,
  ChangeEvent,
  useState,
  KeyboardEvent,
} from "react";

type AppNavBarProps = {
  settings: AppSettings;
  setSettings: Dispatch<SetStateAction<AppSettings>>;
};

const AppNavBar: FC<AppNavBarProps> = ({
  settings,
  setSettings,
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

  return (
    <Navbar isBlurred isBordered className="w-full justify-start">
      <NavbarContent>
        <NavbarItem>
          {" "}
          <Button
            variant="faded"
            className="underline text-blue-400"
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
      </NavbarContent>
    </Navbar>
  );
};

export default AppNavBar;
