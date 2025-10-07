import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from './lib/i18n/routing';

export default getRequestConfig(async ({ locale = "ar" }) => {
    // Validate that the incoming `locale` parameter is valid
    if (!locale || !routing.locales.includes(locale as any)) notFound();

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default
    };
});
