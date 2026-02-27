'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabaseClient';  // seu createClient

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log('Login bem-sucedido!', data.user);
      // Redireciona para home ou admin
      window.location.href = '/';
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-dark mb-6 text-center">Login</h1>
        
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block text-gray-soft mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 text-dark border border-gray-soft rounded focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-soft mb-2">Senha</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border text-dark border-gray-soft rounded focus:outline-none focus:border-accent-gold"
              required
            />
          </div>

          {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent-gold text-cream py-3 rounded font-medium hover:bg-accent-mauve transition-colors cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="mt-4 text-center text-gray-soft">
          Ainda não tem conta?{' '}
          <a href="/cadastro" className="text-accent-gold hover:underline">Cadastre-se</a>
        </p>
      </div>
    </div>
  );
}