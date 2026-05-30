'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const sb = createClient()

    if (isSignUp) {
      const { error } = await sb.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('확인 이메일을 발송했어요! 이메일에서 링크를 클릭해주세요.')
    } else {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) setError('이메일 또는 비밀번호가 올바르지 않아요.')
      else router.push('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white/97 rounded-[32px] p-12 max-w-[420px] w-full shadow-[0_30px_90px_rgba(0,0,0,0.25)] text-center">
        <div className="text-5xl mb-4">🌱</div>
        <h1 className="text-2xl font-black text-[#2d2d2d] mb-2">오늘의 화분 키우기</h1>
        <p className="text-[16px] text-[#aaa] mb-8">투두를 완성하며 화분을 키워요!</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-left">
          <div>
            <label className="text-[19px] font-black text-[#888] uppercase tracking-wide">이메일</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full mt-1.5 border-2 border-[#f0f0f0] rounded-xl px-4 py-3 text-sm font-bold text-[#334155] outline-none transition-colors focus:border-[#FF3CAC] bg-[#fafafa] focus:bg-white"
              placeholder="hello@example.com"
            />
          </div>
          <div>
            <label className="text-[19px] font-black text-[#888] uppercase tracking-wide">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full mt-1.5 border-2 border-[#f0f0f0] rounded-xl px-4 py-3 text-sm font-bold text-[#334155] outline-none transition-colors focus:border-[#FF3CAC] bg-[#fafafa] focus:bg-white"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-[16px] text-red-500 font-bold">{error}</p>}
          {message && <p className="text-[16px] text-green-600 font-bold">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gradient-to-br from-[#f093fb] to-[#FF3CAC] text-white border-none rounded-full py-4 text-sm font-black cursor-pointer transition-all duration-300 shadow-[0_8px_28px_rgba(255,60,172,0.38)] disabled:opacity-60 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_12px_36px_rgba(255,60,172,0.5)]"
          >
            {loading ? '처리 중...' : isSignUp ? '회원가입' : '로그인'}
          </button>
        </form>

        <button
          onClick={() => { setIsSignUp(!isSignUp); setError(''); setMessage('') }}
          className="mt-5 text-[16px] text-[#aaa] font-bold cursor-pointer hover:text-[#FF3CAC] transition-colors bg-transparent border-none"
        >
          {isSignUp ? '이미 계정이 있어요 → 로그인' : '계정이 없어요 → 회원가입'}
        </button>
      </div>
    </div>
  )
}
