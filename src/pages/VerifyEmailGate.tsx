import { useState } from 'react';
import type { User } from 'firebase/auth';
import { MailCheck } from 'lucide-react';
import { formatAuthError, resendVerificationEmail } from '../firebase/auth';

interface VerifyEmailGateProps {
  user: User;
  onRefresh: () => Promise<void>;
  onLogout: () => Promise<void>;
}

export function VerifyEmailGate({
  user,
  onRefresh,
  onLogout,
}: VerifyEmailGateProps) {
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCheck = async () => {
    setChecking(true);
    setError(null);
    setMessage(null);
    try {
      await onRefresh();
      if (!user.emailVerified) {
        setMessage('Your email is not verified yet. Please click the link in your inbox.');
      }
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setChecking(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError(null);
    setMessage(null);
    try {
      await resendVerificationEmail(user);
      setMessage(`Verification email sent to ${user.email}.`);
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F7F4] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E5E9E4] rounded-xl p-6 sm:p-8">
        <div className="w-10 h-10 rounded-lg bg-[#EAF1EA] text-[#52765D] flex items-center justify-center mb-4">
          <MailCheck className="w-5 h-5" aria-hidden="true" />
        </div>

        <h1 className="text-xl font-semibold text-[#252A26] mb-1.5">
          Verify your email address
        </h1>
        <p className="text-sm text-[#777F78] leading-relaxed mb-5">
          We sent a verification link to{' '}
          <span className="font-medium text-[#252A26]">{user.email}</span>. Please
          verify your email to unlock your private Cloud Firestore workspace.
        </p>

        {error ? (
          <div
            role="alert"
            className="mb-4 px-3.5 py-2.5 text-sm text-[#B3433E] bg-[#FBECEB] border border-[#EBC3C1] rounded-lg"
          >
            {error}
          </div>
        ) : null}

        {message ? (
          <div
            role="status"
            className="mb-4 px-3.5 py-2.5 text-sm text-[#3F8559] bg-[#EAF1EA] border border-[#CBE0D2] rounded-lg"
          >
            {message}
          </div>
        ) : null}

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={handleCheck}
            disabled={checking}
            className="w-full py-2.5 px-4 text-sm font-medium text-white bg-[#52765D] hover:bg-[#42634C] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {checking ? 'Checking...' : "I've verified my email"}
          </button>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="w-full py-2.5 px-4 text-sm font-medium text-[#252A26] bg-[#F6F7F4] hover:bg-[#E5E9E4] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
          >
            {resending ? 'Sending...' : 'Resend verification email'}
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2 text-sm font-medium text-[#777F78] hover:text-[#252A26] cursor-pointer"
          >
            Sign out and use another account
          </button>
        </div>
      </div>
    </div>
  );
}
