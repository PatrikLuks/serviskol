import { useSession, signIn, signOut } from 'next-auth/react';

export default function UserInfo() {
  const { data: session, status } = useSession();

  if (status === 'loading') return <div>Načítání uživatele…</div>;
  if (!session)
    return (
      <button className="px-3 py-1 rounded bg-blue-600 text-white" onClick={() => signIn('github')}>Přihlásit se přes GitHub</button>
    );
  return (
    <div className="flex items-center gap-2">
      <img src={session.user.image} alt="avatar" className="w-7 h-7 rounded-full" />
      <span className="font-semibold">{session.user.name || session.user.email}</span>
      <span className="text-xs text-gray-500">({session.user.role})</span>
      <button className="px-2 py-1 rounded bg-gray-200 text-gray-700 ml-2" onClick={() => signOut()}>Odhlásit</button>
    </div>
  );
}
