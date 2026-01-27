import { useTranslation } from 'react-i18next'
import './Success.css'

function Success({ user }) {
  const { t } = useTranslation()

  return (
    <div className="container">
      <div className="success-screen">
        <h1>{t('success.title')}</h1>
        {user && (
          <div className="user-info">
            <p>{t('success.welcome', { name: `${user.first_name} ${user.last_name}`.trim() })}</p>
            <p>
              {t('success.role', {
                role: t(`common.roles.${user.role}`, user.role),
              })}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Success
