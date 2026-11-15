import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  email: string;
  name?: string | null;
  displayName?: string | null;
  baseCurrency: string;
  createdAt: string;
}

export function useAuth() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: user, isLoading, isError } = useQuery<User | null>({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      try {
        const res = await api.get<{ user: User }>('/auth/me');
        if (!res?.user) return null;
        return {
          ...res.user,
          name: res.user.displayName || res.user.name || res.user.email.split('@')[0],
          baseCurrency: res.user.baseCurrency || 'MAD',
        };
      } catch (err) {
        return null;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const res = await api.post<{ user: User }>('/auth/login', credentials);
      return {
        ...res.user,
        name: res.user.displayName || res.user.name || res.user.email.split('@')[0],
        baseCurrency: res.user.baseCurrency || 'MAD',
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      navigate('/dashboard', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: {
      email: string;
      password: string;
      displayName?: string;
      name?: string;
      baseCurrency?: string;
    }) => {
      const res = await api.post<{ user: User }>('/auth/register', payload);
      return {
        ...res.user,
        name: res.user.displayName || res.user.name || res.user.email.split('@')[0],
        baseCurrency: payload.baseCurrency || res.user.baseCurrency || 'MAD',
      };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      navigate('/dashboard', { replace: true });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await api.post('/auth/logout');
    },
    onSuccess: () => {
      queryClient.setQueryData(['auth', 'me'], null);
      queryClient.clear();
      navigate('/', { replace: true });
    },
  });

  return {
    user: user ?? null,
    isAuthenticated: !!user,
    isLoading,
    isError,
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
  };
}

