'use client';
import { LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { redirect } from 'next/navigation';
import { useState } from 'react';

interface LogoutButtonProps {
  mobile?: boolean;
}

export function LogoutButton({ mobile = false }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();

  async function handleLogout() {
    setLoading(true);
    await logout();
    redirect('/');
  }

if (mobile) {
  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 ml-auto px-4 py-2 text-sm font-medium text-white bg-red-700 shadow rounded-xl hover:bg-red-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        'Saindo...'
      ) : (
        <>
          <LogOut className="h-4 w-4" />
          Sair da conta
        </>
      )}
    </button>
  );
}

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="flex items-center gap-2 w-full text-left px-2 py-1 text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed rounded"
    >
      {loading ? 'Saindo...' : 'Sair'}
    </button>
  );
}
