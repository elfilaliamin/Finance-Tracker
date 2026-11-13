import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/api/client';
import { useNavigate } from 'react-router-dom';

export interface User {
  id: string;
  email: string;
  name: string | null;
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
        return res.user;
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
      return res.user;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['auth', 'me'], data);
      navigate('/dashboard', { replace: true });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (payload: { email: string; password: string; name?: string; baseCurrency?: string }) => {
      const res = await api.post<{ user: User }>('/auth/register', payload);
      return res.user;
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
      navigate('/login', { replace: true });
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

