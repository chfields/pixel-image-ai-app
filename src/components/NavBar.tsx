import { Button, Navbar, NavbarItem } from "@heroui/react";
import { A } from "framer-motion/dist/types.d-DagZKalS";
import { FC } from "react";

type AppNavBarProps = {
  settings: AppSettings;
  setSettings: (settings: AppSettings) => void;
};

const AppNavBar: FC<AppNavBarProps> = ({ settings, setSettings }: AppNavBarProps) => {
  return (
    <Navbar isBlurred isBordered className="w-full justify-start">
      <NavbarItem>
        {" "}
        <Button
          variant="faded"
          className="underline text-blue-400"
          onPress={async () => {
            const directories = await window.fileAPI.selectDirectory();
            if (directories.length > 0) {
              setSettings({ directory: directories[0] });
              localStorage.setItem("currentDirectory", directories[0]);
            }
          }}
        >
          {settings.directory
            ? `Directory: ${settings.directory}`
            : "Select Directory"}
        </Button>{" "}
      </NavbarItem>
    </Navbar>
  );
};

export default AppNavBar;
