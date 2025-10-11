import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from './lib/i18n/routing';

export default getRequestConfig(async ({ locale }) => {
    // Validate that the incoming `locale` parameter is valid
    const validLocale = locale || routing.defaultLocale;

    if (!routing.locales.includes(validLocale as any)) {
        notFound();
    }

    return {
        locale: validLocale,
        messages: (await import(`./messages/${validLocale}.json`)).default
    };
});
