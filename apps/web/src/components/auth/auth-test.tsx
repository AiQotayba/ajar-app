"use client"

import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { useTranslations } from 'next-intl'

export function AuthTest() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const t = useTranslations()

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Authentication Status</h3>
      
      <div className="space-y-2">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        {user && (
          <>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Email:</strong> {user.email || 'Not provided'}</p>
            <p><strong>Role:</strong> {user.role}</p>
            <p><strong>Status:</strong> {user.status}</p>
            <p><strong>Phone Verified:</strong> {user.phone_verified ? 'Yes' : 'No'}</p>
          </>
        )}
      </div>

      {isAuthenticated && (
        <Button 
          onClick={logout}
          className="mt-4"
          variant="destructive"
        >
          {t('auth.logout.confirm')}
        </Button>
      )}
    </div>
  )
}
