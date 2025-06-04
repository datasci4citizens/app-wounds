import React from 'react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  bgColor?: string;
  imageUrl?: string;
  theme?: 'blue' | 'purple' | 'light_blue' | 'custom';
  customThemeColor?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  title,
  description,
  icon,
  onClick,
  className,
  bgColor,
  imageUrl,
  theme = 'blue',
  customThemeColor,
}) => {

  const themeColors = {
    blue: "#3357E6",
    light_blue: "#A6BBFF",
    purple: "#7E5CEF",
    custom: customThemeColor || "#3357E6", // Fallback to blue if no custom color
  };

  // Determine final background color based on props priority:
  // 1. Direct bgColor prop (highest priority)
  // 2. Theme selection
  const backgroundColor = bgColor || themeColors[theme];

  return (
    <div 
      className={cn("relative w-full cursor-pointer mb-4", className)}
      onClick={onClick}
    >
      <div 
        className="w-full h-20 rounded-xl flex items-center relative overflow-hidden"
        style={{ backgroundColor }}
      >
        <div className="flex-1 flex items-center px-4">
          {/* Circle for icon */}
          <div className="absolute left-4 w-10 h-10 rounded-full bg-[#F9FAFB] flex items-center justify-center">
            {icon}
          </div>
          
          {/* Content */}
          <div className="ml-16">
            <h3 className="text-[#F9FAFB] text-sm font-medium">
              {title}
            </h3>
            {description && (
              <p className="text-[#F9FAFB] text-xs opacity-80 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Vertical separator line */}
        <div className="h-full w-px bg-white/20"></div>

        {/* Gray rectangle section or image */}
        {imageUrl ? (
          <div className="h-full w-[25%]">
            <img 
              src={imageUrl} 
              alt={title} 
              className="h-full w-full object-contain p-1"
            />
          </div>
        ) : (
          <div className="h-full w-[25%] bg-[#E5E7EB] flex items-center justify-center relative">
            {/*Triangle*/}
            <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-0 h-0 
                            border-l-[14px] border-l-transparent 
                            border-r-[14px] border-r-transparent 
                            border-b-[20px] border-b-[#9CA3AF]"></div>
            
            {/* Square */}
            <div className="absolute bottom-4 left-4 w-5 h-5 bg-[#9CA3AF] rounded-sm"></div>
            
            {/* Circle */}
            <div className="absolute bottom-4 right-4 w-5 h-5 bg-[#9CA3AF] rounded-full"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryCard;
