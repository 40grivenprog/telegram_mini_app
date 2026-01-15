interface ErrorRouteProps {
  error: string | null
}

export default function ErrorRoute({ error }: ErrorRouteProps) {
  return (
    <div className="container">
      <div className="error-screen">
        <div className="error-message">{error || 'Произошла ошибка'}</div>
      </div>
    </div>
  )
}
