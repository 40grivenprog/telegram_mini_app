import { useTranslation } from 'react-i18next'

interface ErrorRouteProps {
  error: string | null
}

export default function ErrorRoute({ error }: ErrorRouteProps) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <div className="error-screen">
        <div className="error-message">{error || t('error.generic')}</div>
      </div>
    </div>
  )
}
