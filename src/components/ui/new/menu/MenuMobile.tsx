import { useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { FaHome } from 'react-icons/fa';
import { IoNotifications } from 'react-icons/io5';

interface MenuMobileProps {
  className?: string;
  onHomeClick?: () => void;
  onNewCaseClick?: () => void;
  onNotificationsClick?: () => void;
  activePath?: string; // Optional override for active path
}

export function MenuMobile({ 
  className = '', 
  onHomeClick, 
  onNewCaseClick, 
  onNotificationsClick,
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
      return activePath === '/specialist' || activePath === '/specialist/menu';
    }
    return (
      location.pathname === '/specialist' || 
      location.pathname === '/specialist/menu' || 
      location.pathname.startsWith('/specialist/menu/')
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
          isActive('/specialist/case/new') ? 'bg-[#FAD5D2]' : ''
        }`}>
          <Plus className={`w-5 h-5 ${isActive('/specialist/case/new') ? 'text-[#0041E9]' : 'text-gray-400'}`} />
        </div>
        <span className={`text-xs mt-1 ${isActive('/specialist/case/new') ? 'text-[#0041E9] font-medium' : 'text-gray-500'}`}>
          Novo caso
        </span>
      </button>
      
      <button
        onClick={onNotificationsClick}
        className="flex flex-col items-center justify-center w-24"
      >
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isActive('/specialist/notifications') ? 'bg-[#FAD5D2]' : ''
        }`}>
          <IoNotifications className={`w-5 h-5 ${isActive('/specialist/notifications') ? 'text-[#0041E9]' : 'text-gray-400'}`} />
        </div>
        <span className={`text-xs mt-1 ${isActive('/specialist/notifications') ? 'text-[#0041E9] font-medium' : 'text-gray-500'}`}>
          Notificações
        </span>
      </button>
    </div>
  );
}