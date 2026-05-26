import React from 'react';
import { useState } from 'react';
import { LockKeyhole, UserPlus } from 'lucide-react';
import { authApi } from '../services/api';

export default function AuthPage({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'guest',
  });
  const [status, setStatus] = useState({ loading: false, error: '' });

  const submit = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '' });
    try {
      const payload =
        mode === 'login'
          ? await authApi.login({ email: form.email, password: form.password })
          : await authApi.register(form);
      localStorage.setItem('staysimple_token', payload.token);
      localStorage.setItem('staysimple_user', JSON.stringify(payload.user));
      onAuth(payload.user);
    } catch (error) {
      setStatus({ loading: false, error: error.message });
    }
  };

  return (
    <main className="mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl place-items-center px-4 py-10 sm:px-6 lg:px-8">
      <section className="w-full max-w-md rounded-lg border border-line bg-white p-6 shadow-soft">
        <div className="mb-6 flex rounded-md bg-soft p-1">
          {['login', 'register'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setMode(item)}
              className={`h-10 flex-1 rounded-md text-sm font-semibold capitalize ${
                mode === item ? 'bg-white text-ink shadow-sm' : 'text-muted'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mb-6">
          <span className="grid h-11 w-11 place-items-center rounded-full bg-coral/10 text-coral">
            {mode === 'login' ? <LockKeyhole size={20} /> : <UserPlus size={20} />}
          </span>
          <h1 className="mt-4 text-2xl font-semibold text-ink">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted">
            Use a guest account to book stays or a host account to publish listings.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Name</span>
              <input
                required
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
              />
            </label>
          )}
          <label className="block">
            <span className="text-sm font-medium text-ink">Email</span>
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-ink">Password</span>
            <input
              required
              type="password"
              minLength="6"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
            />
          </label>
          {mode === 'register' && (
            <label className="block">
              <span className="text-sm font-medium text-ink">Role</span>
              <select
                value={form.role}
                onChange={(event) => setForm({ ...form, role: event.target.value })}
                className="focus-ring mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm"
              >
                <option value="guest">Guest</option>
                <option value="host">Host</option>
              </select>
            </label>
          )}

          {status.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</p>}

          <button
            type="submit"
            disabled={status.loading}
            className="h-11 w-full rounded-md bg-ink text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
          >
            {status.loading ? 'Please wait...' : mode === 'login' ? 'Sign in' : 'Register'}
          </button>
        </form>
      </section>
    </main>
  );
}
