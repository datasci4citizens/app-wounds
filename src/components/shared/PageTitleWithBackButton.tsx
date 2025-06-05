import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageTitleWithBackButtonProps {
  title: string;
  backPath?: string;
  onBackClick?: () => void;
  className?: string;
}

/**
 * PageTitleWithBackButton component - provides a consistent title with back button
 * Used across patient and wound pages
 */
export const PageTitleWithBackButton = ({ 
  title, 
  backPath, 
  onBackClick,
  className = ""
}: PageTitleWithBackButtonProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBackClick) {
      onBackClick();
    } else if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1); // Default behavior: go back in history
    }
  };

  return (
    <div className={`flex items-center justify-start w-full mb-8 mt-8 ${className}`}>
      <div 
        className="bg-[#0120AC] rounded-lg flex items-center justify-center cursor-pointer mr-4 w-8 h-8"
        onClick={handleBackClick}
      >
        <ArrowLeft className="text-white" size={16}/>
      </div>
      <h1 className="text-[#0120AC] text-xl font-bold text-center flex-1 mr-14">
        {title}
      </h1>
    </div>
  );
};

export default PageTitleWithBackButton;