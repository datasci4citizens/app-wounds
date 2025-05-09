import React from 'react';

/**
 * Props for the PatientIcon component
 * 
 * @interface PatientIconProps
 * @property {number} [size=1] - Size multiplier for the icon (1 = 98x98px)
 * @property {string} [className=''] - Additional CSS classes to apply to the SVG
 * @property {number|string} [borderRadius=10] - Border radius for the icon background
 *   Can be a number (in SVG units) or a string (e.g., "50%")
 */
interface PatientIconProps {
  size?: number;
  className?: string;
  borderRadius?: number | string;
}

/**
 * PatientIcon component
 * 
 * Renders a patient icon with a customizable background.
 * The icon represents a patient and is used for patient profiles
 * and patient identification in healthcare applications.
 * 
 * @component
 * @example
 * // Basic usage with default props
 * <PatientIcon />
 * 
 * @example
 * // With custom size and rounded corners
 * <PatientIcon size={2.5} borderRadius={49} />
 * 
 * @example
 * // Fully circular icon using percentage
 * <PatientIcon size={1.5} borderRadius="50%" className="my-icon" />
 */
export const PatientIcon: React.FC<PatientIconProps> = ({
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
      
      {/* Patient icon path */}
      <path d="M49 45.1666C46.8917 45.1666 45.0868 44.4159 43.5854 42.9145C42.084 41.4131 41.3334 39.6083 41.3334 37.4999C41.3334 35.3916 42.084 33.5867 43.5854 32.0853C45.0868 30.5839 46.8917 29.8333 49 29.8333C51.1084 29.8333 52.9132 30.5839 54.4146 32.0853C55.916 33.5867 56.6667 35.3916 56.6667 37.4999C56.6667 39.6083 55.916 41.4131 54.4146 42.9145C52.9132 44.4159 51.1084 45.1666 49 45.1666ZM49 41.3333C50.0542 41.3333 50.9566 40.9579 51.7073 40.2072C52.458 39.4565 52.8334 38.5541 52.8334 37.4999C52.8334 36.4458 52.458 35.5433 51.7073 34.7926C50.9566 34.0419 50.0542 33.6666 49 33.6666C47.9459 33.6666 47.0434 34.0419 46.2927 34.7926C45.542 35.5433 45.1667 36.4458 45.1667 37.4999C45.1667 38.5541 45.542 39.4565 46.2927 40.2072C47.0434 40.9579 47.9459 41.3333 49 41.3333ZM33.6667 68.1666V55.1812C33.6667 54.0951 33.9382 53.0968 34.4813 52.1864C35.0243 51.276 35.775 50.5652 36.7334 50.0541C38.3625 49.2235 40.2073 48.5208 42.2677 47.9458C44.3281 47.3708 46.5722 47.0833 49 47.0833C51.4278 47.0833 53.6719 47.3708 55.7323 47.9458C57.7927 48.5208 59.6375 49.2235 61.2667 50.0541C62.225 50.5652 62.9757 51.276 63.5188 52.1864C64.0618 53.0968 64.3334 54.0951 64.3334 55.1812V64.3333C64.3334 65.3874 63.958 66.2898 63.2073 67.0405C62.4566 67.7912 61.5542 68.1666 60.5 68.1666H44.6875C43.2181 68.1666 41.9722 67.6555 40.95 66.6333C39.9278 65.611 39.4167 64.3652 39.4167 62.8958C39.4167 61.4263 39.9278 60.1805 40.95 59.1583C41.9722 58.136 43.2181 57.6249 44.6875 57.6249H50.1021L53.0729 51.2999C52.434 51.1721 51.7792 51.0763 51.1084 51.0124C50.4375 50.9485 49.7347 50.9166 49 50.9166C46.7 50.9166 44.6556 51.1961 42.8667 51.7551C41.0778 52.3142 39.6243 52.8971 38.5063 53.5041C38.1868 53.6638 37.9393 53.8954 37.7636 54.1989C37.5879 54.5023 37.5 54.8298 37.5 55.1812V68.1666H33.6667ZM44.6875 64.3333H46.9875L48.3292 61.4583H44.6875C44.3042 61.4583 43.9688 61.602 43.6813 61.8895C43.3938 62.177 43.25 62.5124 43.25 62.8958C43.25 63.2791 43.3938 63.6145 43.6813 63.902C43.9688 64.1895 44.3042 64.3333 44.6875 64.3333ZM51.2042 64.3333H60.5V55.1812C60.5 54.8298 60.4122 54.5023 60.2365 54.1989C60.0608 53.8954 59.8292 53.6638 59.5417 53.5041C59.1584 53.3124 58.7431 53.1128 58.2959 52.9051C57.8486 52.6975 57.3695 52.4978 56.8584 52.3062L51.2042 64.3333Z" fill="#1A3BCC"/>
    </svg>
  );
};