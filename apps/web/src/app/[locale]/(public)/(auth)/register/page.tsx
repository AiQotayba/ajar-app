import { RegisterForm } from "@/components/auth/pages/register-form"
import { getTranslations } from "next-intl/server"
import { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'auth.register' })
  
  return {
    title: t('title'),
    description: t('subtitle'),
    openGraph: {
      title: t('title'),
      description: t('subtitle'),
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title: t('title'),
      description: t('subtitle'),
    },
  }
}

export default function RegisterPage() {
  return <RegisterForm />
}
