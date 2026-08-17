import { useState } from 'react'
import { signInWithPopup } from 'firebase/auth'
import { auth, googleProvider, ALLOWED_EMAILS } from '../firebase.ts'
import loginLeft from '../assets/login-left.png'
import loginRight from '../assets/login-right.png'

export default function LoginScreen() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleGoogleLogin() {
    setError('')
    setLoading(true)
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const email = result.user.email
      if (!email || !ALLOWED_EMAILS.includes(email)) {
        setError('Essa conta não tem acesso a esta grade.')
        await auth.signOut()
      }
    } catch {
      setError('Não foi possível entrar. Tente de novo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6 px-6 py-8">
      <img
        src={loginLeft}
        alt=""
        className="w-full max-w-xs h-40 md:w-64 md:h-96 object-cover rounded-lg border border-divider"
      />

      <div className="bg-surface border border-divider rounded-lg p-8 w-80 text-left shadow-[0_0_0_1px_#3f424d]">
        <p className="text-accent text-xs font-semibold tracking-wider mb-2">GRADE SEMANAL</p>
        <h1 className="text-2xl font-medium m-0 mb-5 text-text">Entrar</h1>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 border border-accent text-accent rounded-md px-4 py-3 text-[15px] font-medium cursor-pointer hover:bg-accent/10 disabled:opacity-60"
        >
          {loading ? 'Entrando…' : 'Entrar com Google'}
        </button>

        {error && <p className="text-red-400 text-xs mt-3">{error}</p>}

        <p className="text-neutral-400 text-xs mt-4 leading-relaxed">
          Só as contas autorizadas conseguem acessar a grade.
        </p>
      </div>

      <img
        src={loginRight}
        alt=""
        className="w-full max-w-xs h-40 md:w-64 md:h-96 object-cover rounded-lg border border-divider"
      />
    </div>
  )
}