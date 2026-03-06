'use client';

import { useSession, signIn, signOut } from 'next-auth/react';
import Image from 'next/image';

export default function AuthButton() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="auth-skeleton" aria-hidden="true" />;
  }

  if (!session) {
    return (
      <button
        className="auth-button sign-in"
        onClick={() => signIn('google')}
        aria-label="Sign in with Google"
      >
        Sign in
      </button>
    );
  }

  return (
    <div className="auth-user">
      {session.user.image && (
        <Image
          src={session.user.image}
          alt={session.user.name ?? 'User avatar'}
          width={32}
          height={32}
          className="auth-avatar"
          referrerPolicy="no-referrer"
        />
      )}
      <button
        className="auth-button sign-out"
        onClick={() => signOut()}
        aria-label="Sign out"
      >
        Sign out
      </button>
    </div>
  );
}
