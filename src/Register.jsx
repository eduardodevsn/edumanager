import { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'

export default function Register({ onGoLogin }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password || !confirm) { setError('Completá todos los campos.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    if (password !== confirm) { setError('Las contraseñas no coinciden.'); return }

    setLoading(true)
    try {
      await createUserWithEmailAndPassword(auth, email.trim(), password)
    } catch (err) {
      setError(firebaseErrorMsg(err.code))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#000',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20,
    }}>
      <div
        className="auth-card"
        style={{
          background: '#111', border: '1px solid rgba(255,255,255,.08)',
          borderRadius: 20, padding: '36px 32px',
          width: '100%', maxWidth: 400,
          animation: 'fadeUp .38s ease both',
        }}
      >
        {/* Logo */}
        <div style={{ marginBottom: 28, textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-.025em' }}>
            Edu<span style={{ color: '#00FF87' }}>.dev</span>
          </div>
          <div style={{ fontSize: '.65rem', color: 'rgba(255,255,255,.3)', marginTop: 3, fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase' }}>
            Manager
          </div>
          <div style={{ marginTop: 18, fontSize: '1.05rem', fontWeight: 700 }}>Crear cuenta</div>
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.38)', marginTop: 4 }}>Registrá tu acceso al sistema</div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input
              className="fi"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              autoComplete="email"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Contraseña
            </label>
            <input
              className="fi"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="new-password"
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: '.73rem', fontWeight: 600, color: 'rgba(255,255,255,.45)', letterSpacing: '.07em', textTransform: 'uppercase' }}>
              Confirmar contraseña
            </label>
            <input
              className="fi"
              type="password"
              placeholder="Repetí la contraseña"
              value={confirm}
              onChange={e => { setConfirm(e.target.value); setError('') }}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div style={{
              background: 'rgba(255,68,68,.08)', border: '1px solid rgba(255,68,68,.25)',
              borderRadius: 10, padding: '10px 14px',
              fontSize: '.82rem', color: '#FF6B6B',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn-p"
            style={{ marginTop: 6 }}
            disabled={loading}
          >
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.82rem', color: 'rgba(255,255,255,.38)' }}>
          ¿Ya tenés cuenta?{' '}
          <button
            onClick={onGoLogin}
            style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}
          >
            Iniciar sesión
          </button>
        </p>
      </div>
    </div>
  )
}

function firebaseErrorMsg(code) {
  const msgs = {
    'auth/email-already-in-use': 'Ya existe una cuenta con ese email.',
    'auth/invalid-email':        'El email ingresado no es válido.',
    'auth/weak-password':        'La contraseña es muy débil. Usá al menos 6 caracteres.',
    'auth/network-request-failed': 'Error de conexión. Verificá tu internet.',
  }
  return msgs[code] || 'Ocurrió un error. Intentá de nuevo.'
}
