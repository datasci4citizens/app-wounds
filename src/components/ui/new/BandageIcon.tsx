import "./bandage.css";

// Define theme types
export type BandageTheme = "default" | "purple" | "custom";

export interface BandageIconProps {
  theme?: BandageTheme;
  backgroundColor?: string;
  bandageColor?: string;
  crossBackgroundColor?: string;
  crossColor?: string;
}

export const BandageIcon: React.FC<BandageIconProps> = ({
  theme = "default",
  backgroundColor,
  bandageColor,
  crossBackgroundColor,
  crossColor,
}) => {
  const themes = {
    default: {
      backgroundColor: "#0033A0",
      bandageColor: "#FFD6CC",
      crossBackgroundColor: "#0033A0",
      crossColor: "#FFD6CC",
    },
    purple: {
      backgroundColor: "#E0E7FF",
      bandageColor: "#A5B4FC",
      crossBackgroundColor: "#E0E7FF",
      crossColor: "#A5B4FC",
    },
  };

  // Get colors based on theme or use custom colors if provided
  const colors = theme === "custom" 
    ? {
        backgroundColor: backgroundColor || "#0033A0",
        bandageColor: bandageColor || "#FFD6CC",
        crossBackgroundColor: crossBackgroundColor || "#0033A0",
        crossColor: crossColor || "#FFD6CC",
      }
    : themes[theme as "default" | "purple"];

  return (
    <div className="bandage-container">
      <div 
        className="bandage-background" 
        style={{ backgroundColor: colors.backgroundColor }}
      />
      <div 
        className="bandage" 
        style={{ 
          backgroundColor: colors.bandageColor,
          borderColor: colors.backgroundColor
        }}
      >
        <div 
          className="bandage-cross-container"
          style={{ backgroundColor: colors.crossBackgroundColor }}
        >
          <span 
            className="bandage-cross"
            style={{ color: colors.crossColor }}
          >
            +
          </span>
        </div>
      </div>
    </div>
  );
};