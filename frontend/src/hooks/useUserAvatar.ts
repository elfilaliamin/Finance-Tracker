import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { useAuth } from './useAuth';

const LOCAL_STORAGE_KEY = 'ft_user_avatar';

export function useUserAvatar() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userKey = user?.id ? `${LOCAL_STORAGE_KEY}_${user.id}` : LOCAL_STORAGE_KEY;

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const avatar: string | null = settings?.dashboardLayout?.avatar || localStorage.getItem(userKey) || null;

  const updateAvatarMutation = useMutation({
    mutationFn: async (newAvatar: string | null) => {
      if (newAvatar) {
        localStorage.setItem(userKey, newAvatar);
      } else {
        localStorage.removeItem(userKey);
      }
      const existingLayout = settings?.dashboardLayout || {};
      return await settingsApi.updateSettings({
        dashboardLayout: {
          ...existingLayout,
          avatar: newAvatar,
        },
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  return {
    avatar,
    setAvatar: updateAvatarMutation.mutateAsync,
    isUpdating: updateAvatarMutation.isPending,
  };
}
