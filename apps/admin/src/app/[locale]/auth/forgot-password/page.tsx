import { Link } from '@/lib/i18n/routing';
import { getTranslations } from 'next-intl/server';

export default async function ForgotPasswordPage() {
  const t = await getTranslations('auth');

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t('forgotPassword')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your phone number to receive a reset code
          </p>
        </div>
        
        <form className="mt-8 space-y-6" action="#" method="POST">
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              {t('phone')}
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              required
              className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="+962791234567"
            />
            <p className="mt-2 text-sm text-gray-500">
              We'll send a verification code to this number
            </p>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Send Reset Code
            </button>
          </div>

          <div className="text-center">
            <span className="text-sm text-gray-600">
              Remember your password?{' '}
              <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                {t('login')}
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
