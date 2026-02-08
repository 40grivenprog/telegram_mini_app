import { useTranslation } from 'react-i18next'
import { apiService } from '../../services/api'

interface ErrorRouteProps {
  error: string | null
}

export default function ErrorRoute({ error }: ErrorRouteProps) {
  const { t } = useTranslation()
  const apiUrl = apiService.baseURL || 'Not configured'
  const errorMessage = error || t('error.generic', { apiUrl })

  return (
    <div className="container">
      <div className="error-screen">
        <div className="error-message">{errorMessage}</div>
      </div>
    </div>
  )
}
