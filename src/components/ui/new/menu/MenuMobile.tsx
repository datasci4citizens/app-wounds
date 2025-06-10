import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FaHome } from 'react-icons/fa';
import { IoNotifications } from 'react-icons/io5';

interface MenuMobileProps {
  className?: string;
  onHomeClick?: () => void;
  onNewCaseClick?: () => void;
  onNotificationsClick?: () => void;
  plusButtonLabel?: string
  plusButtonPath?: string
  homePath?: string
  notificationsPath?: string
  activePath?: string; // Optional override for active path
}

export function MenuMobile({ 
  className = '', 
  onHomeClick, 
  onNewCaseClick, 
  onNotificationsClick,
  plusButtonLabel,
  plusButtonPath,
  homePath,
  notificationsPath,
  activePath 
}: MenuMobileProps) {
  const location = useLocation();
  
  const isActive = (path: string) => {
    // If activePath is provided, use it for comparison, otherwise use location
    if (activePath) {
      return activePath === path;
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };
  
  // Special check for home icon that should be active on both /specialist and /specialist/menu
  const isHomeActive = () => {
    if (activePath) {
      return activePath === homePath;
    }
    return (
      location.pathname === homePath || 
      (homePath && location.pathname.startsWith(homePath))
    );
  };
  
  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-[#F9FAFB] shadow-sm pt-3 pb-7 flex items-center justify-evenly ${className}`}>
      <button
        onClick={onHomeClick}
        className="flex flex-col items-center justify-center w-24"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isHomeActive() ? 'bg-[#FAD5D2]' : ''
        }`}>
          <FaHome className={`w-5 h-5 ${isHomeActive() ? 'text-[#0041E9]' : 'text-gray-400'}`} />
        </div>
        <span className={`text-xs mt-1 ${isHomeActive() ? 'text-[#0041E9] font-medium' : 'text-gray-500'}`}>
          Home
        </span>
      </button>
      
      <button
        onClick={onNewCaseClick}
        className="flex flex-col items-center justify-center w-24"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          plusButtonPath && isActive(plusButtonPath) ? 'bg-[#FAD5D2]' : ''
        }`}>
          <Plus className={`w-5 h-5 ${plusButtonPath && isActive(plusButtonPath) ? 'text-[#0041E9]' : 'text-gray-400'}`} />
        </div>
        <span className={`text-xs mt-1 ${plusButtonPath && isActive(plusButtonPath) ? 'text-[#0041E9] font-medium' : 'text-gray-500'}`}>
          {plusButtonLabel}
        </span>
      </button>
      
      <button
        onClick={onNotificationsClick}
        className="flex flex-col items-center justify-center w-24"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          notificationsPath && isActive(notificationsPath) ? 'bg-[#FAD5D2]' : ''
        }`}>
          <IoNotifications className={`w-5 h-5 ${notificationsPath && isActive(notificationsPath) ? 'text-[#0041E9]' : 'text-gray-400'}`} />
        </div>
        <span className={`text-xs mt-1 ${notificationsPath && isActive(notificationsPath) ? 'text-[#0041E9] font-medium' : 'text-gray-500'}`}>
          Notificações
        </span>
      </button>
    </div>
  );
}