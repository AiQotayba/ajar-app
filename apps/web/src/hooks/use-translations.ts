import { useTranslations } from 'next-intl';

export function useTranslationsHook() {
  const t = useTranslations();
  return t;
}

// Specific translation hooks for different sections
export function useAuthTranslations() {
  return useTranslations('auth');
}

export function useProfileTranslations() {
  return useTranslations('profile');
}

export function useCommonTranslations() {
  return useTranslations('common');
}

export function useNavigationTranslations() {
  return useTranslations('navigation');
}

export function usePropertyTranslations() {
  return useTranslations('property');
}

export function useSearchTranslations() {
  return useTranslations('search');
}

export function useNotificationsTranslations() {
  return useTranslations('notifications');
}

export function useSettingsTranslations() {
  return useTranslations('settings');
}
