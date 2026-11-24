import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import {
  formatAuthError,
  loginWithEmail,
  loginWithGoogle,
  resetPassword,
} from '../firebase/auth';

interface LoginProps {
  onSwitchToRegister: () => void;
}

export function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [forgotMode, setForgotMode] = useState(false);

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }
    if (!forgotMode && !password) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      if (forgotMode) {
        await resetPassword(email);
        setInfoMessage(
          'If an account exists for that email, a password reset link has been sent.'
        );
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setInfoMessage(null);
    setGoogleSubmitting(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex flex-col justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-md mx-auto">
        <div className="flex items-center justify-center gap-2.5 mb-7">
          <span
            className="w-9 h-9 rounded-lg bg-[#52765D] flex items-center justify-center text-white"
            aria-hidden="true"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </span>
          <span className="font-['Manrope'] text-2xl font-bold tracking-tight text-[#252A26]">
            TaskFlow
          </span>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-6 sm:p-8">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#252A26]">
              {forgotMode ? 'Reset your password' : 'Sign in to TaskFlow'}
            </h1>
            <p className="text-sm text-[#777F78] mt-1">
              {forgotMode
                ? 'Enter your email address and we will send you a reset link.'
                : 'Organize your daily tasks, deadlines, and focus.'}
            </p>
          </div>

          {error ? (
            <div
              role="alert"
              className="mb-4 px-3.5 py-2.5 text-sm text-[#B3433E] bg-[#FBECEB] border border-[#EBC3C1] rounded-lg"
            >
              {error}
            </div>
          ) : null}

          {infoMessage ? (
            <div
              role="status"
              className="mb-4 px-3.5 py-2.5 text-sm text-[#3F8559] bg-[#EAF1EA] border border-[#CBE0D2] rounded-lg"
            >
              {infoMessage}
            </div>
          ) : null}

          <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
            <div>
              <label
                htmlFor="login-email"
                className="block text-sm font-medium text-[#252A26] mb-1.5"
              >
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] placeholder:text-[#777F78] focus:border-[#52765D] focus:outline-none"
              />
            </div>

            {!forgotMode ? (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-[#252A26]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotMode(true);
                      setError(null);
                      setInfoMessage(null);
                    }}
                    className="text-xs font-medium text-[#52765D] hover:text-[#42634C] cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#FFFFFF] border border-[#E5E9E4] rounded-lg text-[#252A26] placeholder:text-[#777F78] focus:border-[#52765D] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-[#777F78] hover:text-[#252A26] rounded cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting || googleSubmitting}
              className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
            >
              {submitting
                ? forgotMode
                  ? 'Sending reset link...'
                  : 'Signing in...'
                : forgotMode
                  ? 'Send Reset Link'
                  : 'Sign In'}
            </button>
          </form>

          {forgotMode ? (
            <button
              type="button"
              onClick={() => {
                setForgotMode(false);
                setError(null);
                setInfoMessage(null);
              }}
              className="w-full mt-3 py-2 text-sm font-medium text-[#52765D] hover:text-[#42634C] cursor-pointer"
            >
              Back to sign in
            </button>
          ) : (
            <>
              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-[#E5E9E4]" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="bg-[#FFFFFF] px-3 text-[#777F78]">or</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={submitting || googleSubmitting}
                className="w-full py-2.5 px-4 text-sm font-medium text-[#252A26] bg-[#FFFFFF] border border-[#E5E9E4] hover:bg-[#F6F7F4] rounded-lg transition-colors flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                  />
                </svg>
                <span>
                  {googleSubmitting ? 'Connecting...' : 'Continue with Google'}
                </span>
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-[#777F78] mt-6">
          New to TaskFlow?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="font-medium text-[#52765D] hover:text-[#42634C] cursor-pointer"
          >
            Create an account
          </button>
        </p>
      </div>
    </div>
  );
}
