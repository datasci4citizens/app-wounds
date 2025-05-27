import React from 'react';

interface WaveBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  color?: string;
}

export const WaveBackground: React.FC<WaveBackgroundProps> = ({ 
  className = '', 
  children,
  color = "#D0DCFF"
}) => {
  return (
    <div className={`relative w-full ${className}`}>
      <svg 
        width="100%" 
        height="29" 
        viewBox="0 0 430 29" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
      >
        <path 
          d="M0 0H430C430 16.0163 417.016 29 401 29H29C12.9838 29 0 16.0163 0 0Z" 
          fill={color} 
        />
      </svg>
      {children}
    </div>
  );
};

// A version that can be used as a page background with the wave at the top
export const WaveBackgroundLayout: React.FC<WaveBackgroundProps> = ({ 
  className = '', 
  children,
  color = "#D0DCFF"
}) => {
  return (
    <div className={`min-h-screen bg-[#F9FAFB] ${className}`}>
      <svg 
        width="100%" 
        height="29" 
        viewBox="0 0 430 29" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        className="w-full"
      >
        <path 
          d="M0 0H430C430 16.0163 417.016 29 401 29H29C12.9838 29 0 16.0163 0 0Z" 
          fill={color} 
        />
      </svg>
      <div className="container mx-auto p-4 bg-[#F9FAFB]">
        {children}
      </div>
    </div>
  );
};

