import React from 'react';

export const UserProfilePage = ({ user, onLogout }) => {
  return (
    <main className="profile-page">
      <section className="profile-hero">
        <div className="contenedor">
          <h1>Mi Perfil</h1>
          <p className="profile-hero__texto">
            Bienvenido, {user?.nombre || 'Usuario'}.
          </p>
        </div>
      </section>

      <section className="profile-main">
        <div className="contenedor" style={{ maxWidth: '520px', margin: '0 auto' }}>
          <article className="profile-card" style={{ textAlign: 'center', padding: '2.5rem 2rem' }}>
            <div
              className="user-avatar"
              style={{
                width: '64px',
                height: '64px',
                fontSize: '1.5rem',
                margin: '0 auto 1.25rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: 'var(--siena-tostado)',
                color: '#fff',
                fontFamily: 'Inter, system-ui, sans-serif'
              }}
            >
              {(user?.nombre || 'HJ').slice(0, 2).toUpperCase()}
            </div>
            <h2>{user?.nombre}</h2>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>{user?.email}</p>
            <button
              type="button"
              className="home-button home-button--ghost profile-logout"
              onClick={onLogout}
              style={{ width: '100%' }}
            >
              Cerrar sesión
            </button>
          </article>
        </div>
      </section>
    </main>
  );
};
