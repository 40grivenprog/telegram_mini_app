import './Success.css'

function Success({ user }) {
  return (
    <div className="container">
      <div className="success-screen">
        <h1>Hello World</h1>
        {user && (
          <div className="user-info">
            <p>Добро пожаловать, {user.first_name} {user.last_name}!</p>
            <p>Роль: {user.role}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Success
