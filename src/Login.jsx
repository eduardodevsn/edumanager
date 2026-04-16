import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'

const AUTH_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html, body, #root { height: 100%; }
  body { background: #000; color: #fff; font-family: 'Poppins', sans-serif; }
  input, button { font-family: 'Poppins', sans-serif; }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(18px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .auth-card { animation: fadeUp .38s ease both; }
  .fi {
    background: #0d0d0d;
    border: 1.5px solid rgba(255,255,255,.09);
    border-radius: 10px;
    padding: 11px 14px;
    color: #fff;
    font-size: .875rem;
    outline: none;
    transition: border-color .2s;
    width: 100%;
  }
  .fi:focus { border-color: rgba(0,255,135,.45); }
  .fi::placeholder { color: rgba(255,255,255,.22); }
  .btn-p {
    display: flex; align-items: center; justify-content: center; gap: 7px;
    width: 100%; padding: 11px 18px; border-radius: 10px;
    font-size: .9rem; font-weight: 700;
    border: none; cursor: pointer; transition: all .2s;
    background: #00FF87; color: #000;
  }
  .btn-p:hover:not(:disabled) { background: #00e87a; transform: translateY(-1px); box-shadow: 0 8px 20px rgba(0,255,135,.35); }
  .btn-p:disabled { opacity: .55; cursor: not-allowed; }
`

export default function Login({ onGoRegister }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  useEffect(() => {
    const el = document.createElement('style')
    el.id = 'auth-css'
    if (!document.getElementById('auth-css')) {
      el.textContent = AUTH_CSS
      document.head.appendChild(el)
    }
    return () => document.getElementById('auth-css')?.remove()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email.trim() || !password) { setError('Completá todos los campos.'); return }
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password)
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
          <div style={{ marginTop: 18, fontSize: '1.05rem', fontWeight: 700 }}>Iniciar sesión</div>
          <div style={{ fontSize: '.8rem', color: 'rgba(255,255,255,.38)', marginTop: 4 }}>Ingresá con tu cuenta</div>
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
              placeholder="••••••••"
              value={password}
              onChange={e => { setPassword(e.target.value); setError('') }}
              autoComplete="current-password"
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

          <button type="submit" className="btn-p" style={{ marginTop: 6 }} disabled={loading}>
            {loading ? 'Ingresando...' : 'Iniciar sesión'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: '.82rem', color: 'rgba(255,255,255,.38)' }}>
          ¿No tenés cuenta?{' '}
          <button
            onClick={onGoRegister}
            style={{ background: 'none', border: 'none', color: '#00FF87', cursor: 'pointer', fontWeight: 600, fontSize: '.82rem' }}
          >
            Registrarse
          </button>
        </p>
      </div>
    </div>
  )
}

function firebaseErrorMsg(code) {
  const msgs = {
    'auth/user-not-found':       'No existe una cuenta con ese email.',
    'auth/wrong-password':       'Contraseña incorrecta.',
    'auth/invalid-email':        'El email ingresado no es válido.',
    'auth/too-many-requests':    'Demasiados intentos. Intentá más tarde.',
    'auth/user-disabled':        'Esta cuenta fue deshabilitada.',
    'auth/invalid-credential':   'Email o contraseña incorrectos.',
    'auth/network-request-failed': 'Error de conexión. Verificá tu internet.',
  }
  return msgs[code] || 'Ocurrió un error. Intentá de nuevo.'
}
