import React from 'react';

/**
 * Props for the ProfessionalIcon component
 * 
 * @interface ProfessionalIconProps
 * @property {number} [size=1] - Size multiplier for the icon (1 = 98x98px)
 * @property {string} [className=''] - Additional CSS classes to apply to the SVG
 * @property {number|string} [borderRadius=10] - Border radius for the icon background
 *   Can be a number (in SVG units) or a string (e.g., "50%")
 */
interface ProfessionalIconProps {
  size?: number;
  className?: string;
  borderRadius?: number | string;
}

/**
 * ProfessionalIcon component
 * 
 * Renders a healthcare professional icon with a customizable background.
 * The icon represents a medical professional and is used for user profiles
 * and healthcare specialist identification.
 * 
 * @component
 * @example
 * // Basic usage with default props
 * <ProfessionalIcon />
 * 
 * @example
 * // With custom size and rounded corners
 * <ProfessionalIcon size={2.5} borderRadius={49} />
 * 
 * @example
 * // Fully circular icon using percentage
 * <ProfessionalIcon size={1.5} borderRadius="50%" className="my-icon" />
 */
export const ProfessionalIcon: React.FC<ProfessionalIconProps> = ({
  size = 1,
  className = '',
  borderRadius = 10, // Default border radius is 10 as in the original
}) => {
  // Calculate dimensions based on size multiplier
  const width = 98 * size;
  const height = 98 * size;
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 98 98" 
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background rectangle with customizable border radius */}
      <rect width="98" height="98" rx={borderRadius} fill="#D0DCFF"/>
      
      {/* Professional icon path */}
      <path d="M51.875 68.1667C48.425 68.1667 45.4861 66.9528 43.0583 64.525C40.6305 62.0973 39.4166 59.1584 39.4166 55.7084V54.6063C36.6694 54.1591 34.3854 52.8733 32.5646 50.749C30.7437 48.6247 29.8333 46.125 29.8333 43.25V31.75H35.5833V29.8334H39.4166V37.5H35.5833V35.5834H33.6666V43.25C33.6666 45.3584 34.4173 47.1632 35.9187 48.6646C37.4201 50.166 39.225 50.9167 41.3333 50.9167C43.4416 50.9167 45.2465 50.166 46.7479 48.6646C48.2493 47.1632 49 45.3584 49 43.25V35.5834H47.0833V37.5H43.25V29.8334H47.0833V31.75H52.8333V43.25C52.8333 46.125 51.9229 48.6247 50.1021 50.749C48.2812 52.8733 45.9972 54.1591 43.25 54.6063V55.7084C43.25 58.1042 44.0885 60.1407 45.7656 61.8177C47.4427 63.4948 49.4791 64.3334 51.875 64.3334C54.2708 64.3334 56.3073 63.4948 57.9844 61.8177C59.6614 60.1407 60.5 58.1042 60.5 55.7084V52.498C59.3819 52.1146 58.4635 51.4278 57.7448 50.4375C57.026 49.4473 56.6666 48.3292 56.6666 47.0834C56.6666 45.4862 57.2257 44.1285 58.3437 43.0105C59.4618 41.8924 60.8194 41.3334 62.4166 41.3334C64.0139 41.3334 65.3715 41.8924 66.4896 43.0105C67.6076 44.1285 68.1666 45.4862 68.1666 47.0834C68.1666 48.3292 67.8073 49.4473 67.0885 50.4375C66.3698 51.4278 65.4514 52.1146 64.3333 52.498V55.7084C64.3333 59.1584 63.1194 62.0973 60.6916 64.525C58.2639 66.9528 55.325 68.1667 51.875 68.1667ZM62.4166 49C62.9597 49 63.4149 48.8164 63.7823 48.449C64.1496 48.0816 64.3333 47.6264 64.3333 47.0834C64.3333 46.5403 64.1496 46.0851 63.7823 45.7177C63.4149 45.3504 62.9597 45.1667 62.4166 45.1667C61.8736 45.1667 61.4184 45.3504 61.051 45.7177C60.6837 46.0851 60.5 46.5403 60.5 47.0834C60.5 47.6264 60.6837 48.0816 61.051 48.449C61.4184 48.8164 61.8736 49 62.4166 49Z" fill="#1A3BCC"/>
    </svg>
  );
};