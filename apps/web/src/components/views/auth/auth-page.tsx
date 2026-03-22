import { Card, CardContent } from '@/components/ui/card'
import { Link, Outlet, useLocation } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export function AuthPage() {
  const location = useLocation()
  const { t } = useTranslation('auth')

  const isLoginPage = location.href === '/login'
  const isLogoutPage = location.href === '/logout'

  if (isLogoutPage) {
    return (
      <div>
        <Outlet />
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card>
        <CardContent>
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('main.title')}
            </h1>
            <p className="text-muted-foreground">
              {isLoginPage ? (
                <Link to="/register">
                  {t('main.noAccount')}{' '}
                  <span className="text-primary font-medium">
                    {t('main.registerNow')}
                  </span>
                </Link>
              ) : (
                <Link to="/login">
                  {t('main.alreadyRegistered')}{' '}
                  <span className="text-primary font-medium">
                    {t('main.signIn')}
                  </span>
                </Link>
              )}
            </p>
          </div>

          <Outlet />
        </CardContent>
      </Card>
    </div>
  )
}
