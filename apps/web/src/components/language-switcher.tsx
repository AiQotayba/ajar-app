'use client';

import { usePathname, useRouter } from '@/lib/i18n/routing';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦', targetLocale: 'en' },
  { code: 'en', name: 'English', flag: '🇺🇸', targetLocale: 'ar' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  const currentLanguage = languages.find(lang => lang.code === locale);
  const targetLocale = currentLanguage?.targetLocale || 'ar';

  const handleLanguageSwitch = () => {
    // Use next-intl's router to switch locale while keeping the same path
    router.push(pathname, { locale: targetLocale });
  };

  return (
    <div className="flex flex-row">
      <button 
        onClick={handleLanguageSwitch}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {currentLanguage?.flag} {currentLanguage?.name}
        </span>
        <span className="sm:hidden">
          {currentLanguage?.flag}
        </span>
      </button>
    </div>
  );
}