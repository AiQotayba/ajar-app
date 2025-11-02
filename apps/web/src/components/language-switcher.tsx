'use client';

import { usePathname, useRouter } from '@/lib/i18n/routing';
import { Globe } from 'lucide-react';
import { useLocale } from 'next-intl';
import { saveLocalePreference } from '@/lib/i18n/locale-cookie';
import Link from 'next/link';

const languages = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
];

export function LanguageSwitcher() {
  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();

  // Find the language to switch TO (the opposite of current locale)
  const targetLanguage = languages.find(lang => lang.code !== locale);
  const targetLocale = targetLanguage?.code || (locale === 'ar' ? 'en' : 'ar');

  const handleLanguageSwitch = () => {
    // Save locale preference to cookie
    saveLocalePreference(targetLocale);

    // Use next-intl's router to switch locale while keeping the same path
    // router.push(pathname, { locale: targetLocale });
  };

  return (
    <div className="flex flex-row">
      <Link
        href={`/${targetLocale}${pathname}`}
        onClick={handleLanguageSwitch}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer hover:text-primary hover:fill-primary "
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">
          {targetLanguage?.name}
        </span>
        <span className="sm:hidden">
          {targetLanguage?.flag}
        </span>
      </Link>
    </div>
  );
}