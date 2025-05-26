import React from "react";
import { BandageIcon, type BandageTheme } from "@/components/ui/new/bandage-logo/BandageIcon";

interface AppHeaderProps {
  title: string;
  iconTheme?: BandageTheme;
  iconSize?: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  title,
  iconTheme = "faded_blue",
  iconSize = 0.5,
}) => {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-8">
        <BandageIcon theme={iconTheme} size={iconSize} />
      </div>
      <h1 className="text-[#0120AC] text-xl">{title}</h1>
    </div>
  );
};

export default AppHeader;