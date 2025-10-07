# Internationalization Setup with Next-intl

This document explains how to use the internationalization (i18n) setup in the Ajar web application.

## Overview

The application supports two languages:
- **Arabic (ar)** - Default language with RTL support
- **English (en)** - Secondary language with LTR support

## File Structure

```
src/
├── lib/i18n/
│   ├── config.ts          # Next-intl configuration
│   ├── routing.ts         # Routing configuration
│   └── utils.ts           # Utility functions
├── messages/
│   ├── ar.json           # Arabic translations
│   └── en.json           # English translations
├── middleware.ts         # Locale routing middleware
└── app/
    ├── [locale]/         # Locale-based routing
    │   ├── layout.tsx    # Locale-specific layout
    │   └── page.tsx      # Home page
    └── layout.tsx        # Root layout
```

## Usage

### 1. Using Translations in Components

```tsx
import { useTranslations } from 'next-intl';

export default function MyComponent() {
  const t = useTranslations('auth.login');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
    </div>
  );
}
```

### 2. Using Specific Translation Hooks

```tsx
import { useAuthTranslations } from '@/hooks/use-translations';

export default function LoginForm() {
  const t = useAuthTranslations('login');
  
  return (
    <form>
      <label>{t('email')}</label>
      <input type="email" />
      <button>{t('loginButton')}</button>
    </form>
  );
}
```

### 3. Language Switcher Component

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

export default function Header() {
  return (
    <header>
      <LanguageSwitcher />
    </header>
  );
}
```

### 4. Server Components

```tsx
import { getTranslations } from 'next-intl/server';

export default async function ServerComponent() {
  const t = await getTranslations('common');
  
  return <p>{t('loading')}</p>;
}
```

## Translation Files Structure

The translation files are organized by feature:

```json
{
  "auth": {
    "login": { ... },
    "register": { ... },
    "forgotPassword": { ... }
  },
  "profile": { ... },
  "common": { ... },
  "navigation": { ... },
  "property": { ... },
  "search": { ... },
  "notifications": { ... },
  "settings": { ... }
}
```

## RTL/LTR Support

The application automatically handles text direction based on the selected locale:

- **Arabic (ar)**: RTL (right-to-left)
- **English (en)**: LTR (left-to-right)

The layout automatically applies the correct `dir` attribute and CSS classes.

## URL Structure

- `/` - Redirects to default locale (Arabic)
- `/ar/` - Arabic version
- `/en/` - English version
- `/ar/profile` - Arabic profile page
- `/en/profile` - English profile page

## Adding New Translations

1. Add the new keys to both `ar.json` and `en.json`
2. Use the translations in your components
3. Test both languages

## Best Practices

1. **Use nested keys** for better organization
2. **Keep translations consistent** across both languages
3. **Test RTL layout** for Arabic content
4. **Use semantic keys** that describe the content, not the position
5. **Group related translations** in the same namespace

## Example: Adding a New Feature

1. Add translations to both language files:

```json
// ar.json
{
  "newFeature": {
    "title": "الميزة الجديدة",
    "description": "وصف الميزة الجديدة"
  }
}

// en.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "Description of the new feature"
  }
}
```

2. Use in component:

```tsx
import { useTranslations } from 'next-intl';

export default function NewFeature() {
  const t = useTranslations('newFeature');
  
  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

## Troubleshooting

1. **Translations not showing**: Check if the key exists in both language files
2. **RTL not working**: Verify the locale is set to 'ar' and the layout is using the correct dir attribute
3. **Routing issues**: Ensure middleware.ts is properly configured and the [locale] folder structure is correct
