import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook to handle user logout
 * Clears both auth tokens and user data from stores
 */
export const useLogout = () => {
  const router = useRouter();
  const clearUser = useUserStore((state) => state.clearUser);
  const clearTokens = useAuthStore((state) => state.clearTokens);

  const logout = () => {
    // Clear all stored data
    clearTokens();
    clearUser();
    
    // Navigate to login page
    router.push('/login');
  };

  return { logout };
};
