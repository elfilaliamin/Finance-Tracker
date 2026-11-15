import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsApi } from '@/api/settingsApi';
import { useAuth } from './useAuth';

export interface DashboardCustomization {
  // Main sections
  showMetricsGrid: boolean;
  showIncomeTrend: boolean;
  showNetWorthHistory: boolean;
  showSpendingMatrix: boolean;

  // Individual KPI cards
  visibleCards: {
    todaysNetWorth: boolean;
    currentMonthIncome: boolean;
    priorMonthIncome: boolean;
    yearIncome: boolean;
    lifetimeIncome: boolean;
    avgMonthlyIncome: boolean;
    highestIncomeMonth: boolean;
    lowestIncomeMonth: boolean;
    largestIncomeSource: boolean;
    activeIncomeSources: boolean;
    latestIncome: boolean;
    latestNetWorth: boolean;
  };
}

export const DEFAULT_DASHBOARD_CONFIG: DashboardCustomization = {
  showMetricsGrid: true,
  showIncomeTrend: true,
  showNetWorthHistory: true,
  showSpendingMatrix: true,
  visibleCards: {
    todaysNetWorth: true,
    currentMonthIncome: true,
    priorMonthIncome: true,
    yearIncome: true,
    lifetimeIncome: true,
    avgMonthlyIncome: true,
    highestIncomeMonth: true,
    lowestIncomeMonth: true,
    largestIncomeSource: true,
    activeIncomeSources: true,
    latestIncome: true,
    latestNetWorth: true,
  },
};

const LOCAL_STORAGE_KEY = 'ft_dashboard_config';

export function useDashboardConfig() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const storageKey = user?.id ? `${LOCAL_STORAGE_KEY}_${user.id}` : LOCAL_STORAGE_KEY;

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.getSettings(),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const getSavedConfig = (): DashboardCustomization => {
    try {
      const fromSettings = settings?.dashboardLayout?.customization;
      if (fromSettings) {
        return {
          ...DEFAULT_DASHBOARD_CONFIG,
          ...fromSettings,
          visibleCards: {
            ...DEFAULT_DASHBOARD_CONFIG.visibleCards,
            ...(fromSettings.visibleCards || {}),
          },
        };
      }
      const fromLocal = localStorage.getItem(storageKey);
      if (fromLocal) {
        const parsed = JSON.parse(fromLocal);
        return {
          ...DEFAULT_DASHBOARD_CONFIG,
          ...parsed,
          visibleCards: {
            ...DEFAULT_DASHBOARD_CONFIG.visibleCards,
            ...(parsed.visibleCards || {}),
          },
        };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_DASHBOARD_CONFIG;
  };

  const config = getSavedConfig();

  const updateConfigMutation = useMutation({
    mutationFn: async (newConfig: DashboardCustomization) => {
      localStorage.setItem(storageKey, JSON.stringify(newConfig));
      const existingLayout = settings?.dashboardLayout || {};
      return await settingsApi.updateSettings({
        dashboardLayout: {
          ...existingLayout,
          customization: newConfig,
        },
      });
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['settings'], updated);
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const toggleSection = (sectionKey: keyof Omit<DashboardCustomization, 'visibleCards'>) => {
    const updated = {
      ...config,
      [sectionKey]: !config[sectionKey],
    };
    updateConfigMutation.mutate(updated);
  };

  const toggleCard = (cardKey: keyof DashboardCustomization['visibleCards']) => {
    const updated = {
      ...config,
      visibleCards: {
        ...config.visibleCards,
        [cardKey]: !config.visibleCards[cardKey],
      },
    };
    updateConfigMutation.mutate(updated);
  };

  const resetDefaults = () => {
    updateConfigMutation.mutate(DEFAULT_DASHBOARD_CONFIG);
  };

  const setAllCards = (visible: boolean) => {
    const updatedCards = Object.keys(config.visibleCards).reduce((acc, key) => {
      acc[key as keyof DashboardCustomization['visibleCards']] = visible;
      return acc;
    }, {} as DashboardCustomization['visibleCards']);

    const updated = {
      ...config,
      visibleCards: updatedCards,
    };
    updateConfigMutation.mutate(updated);
  };

  return {
    config,
    toggleSection,
    toggleCard,
    resetDefaults,
    setAllCards,
    isUpdating: updateConfigMutation.isPending,
  };
}
