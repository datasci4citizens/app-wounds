import { useState, useEffect } from 'react';
import { WaveBackgroundLayout } from '@/components/ui/new/wave/WaveBackground.tsx';
import { ProfessionalIcon } from '@/components/ui/new/ProfessionalIcon.tsx';
import { MenuMobile } from '@/components/ui/new/menu/MenuMobile.tsx';
import { useNavigate } from 'react-router-dom';

export default function Notifications() {
  const navigate = useNavigate();
  
  // Navigation handlers for the mobile menu
  const handleHomeClick = () => navigate('/specialist/menu');
  const handleNewCaseClick = () => navigate('/specialist/case/new');
  const handleNotificationsClick = () => navigate('/specialist/notifications');

  // State for notifications (to be implemented)
  // const [notifications, setNotifications] = useState([]);
  const [notifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch notifications data (to be implemented)
  useEffect(() => {
    // Example function to fetch notifications
    const fetchNotifications = async () => {
      setLoading(true);
      try {
        // Replace with actual API call when ready
        // const response = await axios.get('notifications-endpoint');
        // setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  return (
    <WaveBackgroundLayout className="bg-[#F9FAFB]">
      <div className="flex justify-center items-center mt-6 mb-6">
        <ProfessionalIcon size={0.6} borderRadius="50%" />
      </div>
      <div className="text-center">
        <h1 className="text-[#0120AC] text-xl font-bold">
          Notificações
        </h1>
      </div>
      
      <div className="px-4 md:px-6 lg:px-8 mt-8 pb-24">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <p>Carregando notificações...</p>
          </div>
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {/* Notification items will go here */}
            <p>Você tem {notifications.length} notificações.</p>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500">Você não tem notificações no momento.</p>
          </div>
        )}
      </div>
      
      {/* Include the mobile menu with notifications path active */}
      <MenuMobile 
        onHomeClick={handleHomeClick}
        onNewCaseClick={handleNewCaseClick}
        onNotificationsClick={handleNotificationsClick}
        activePath="/specialist/notifications"
      />
    </WaveBackgroundLayout>
  );
}