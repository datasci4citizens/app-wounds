import "./bandage.css";

// Define theme types
export type BandageTheme = "default" | "purple" | "custom";

export interface BandageIconProps {
  theme?: BandageTheme;
  backgroundColor?: string;
  bandageColor?: string;
  crossBackgroundColor?: string;
  crossColor?: string;
  size?: number; // Size multiplier (1 = default size)
}

export const BandageIcon: React.FC<BandageIconProps> = ({
  theme = "default",
  backgroundColor,
  bandageColor,
  crossBackgroundColor,
  crossColor,
  size = 1, // Default size multiplier
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

  // Base dimensions that will be multiplied by the size factor
  const BASE_BACKGROUND_SIZE = 80;
  const BASE_BANDAGE_WIDTH = 100;
  const BASE_BANDAGE_HEIGHT = 40;
  const BASE_CROSS_CONTAINER_SIZE = 30;
  const BASE_FONT_SIZE = 30;
  const BASE_BORDER_WIDTH = 2;
  const BASE_BORDER_RADIUS = 18;

  return (
    <div 
      className="bandage-container"
      style={{ 
        width: `${BASE_BACKGROUND_SIZE * 1.5 * size}px`, 
        height: `${BASE_BACKGROUND_SIZE * 1.5 * size}px` 
      }}
    >
      <div 
        className="bandage-background" 
        style={{ 
          backgroundColor: colors.backgroundColor,
          width: `${BASE_BACKGROUND_SIZE * size}px`,
          height: `${BASE_BACKGROUND_SIZE * size}px`
        }}
      />
      <div 
        className="bandage" 
        style={{ 
          backgroundColor: colors.bandageColor,
          borderColor: colors.backgroundColor,
          width: `${BASE_BANDAGE_WIDTH * size}px`,
          height: `${BASE_BANDAGE_HEIGHT * size}px`,
          borderWidth: `${BASE_BORDER_WIDTH * Math.min(size, 1.5)}px`,
          borderRadius: `${BASE_BORDER_RADIUS * size}px`
        }}
      >
        <div 
          className="bandage-cross-container"
          style={{ 
            backgroundColor: colors.crossBackgroundColor,
            width: `${BASE_CROSS_CONTAINER_SIZE * size}px`,
            height: `${BASE_CROSS_CONTAINER_SIZE * size}px`,
            borderRadius: `${4 * size}px`
          }}
        >
          <span 
            className="bandage-cross"
            style={{ 
              color: colors.crossColor,
              fontSize: `${BASE_FONT_SIZE * size}px`
            }}
          >
            +
          </span>
        </div>
      </div>
    </div>
  );
};