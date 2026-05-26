import React from 'react';
import { Home, LogOut, Search, Shield, UserRound } from 'lucide-react';

const navItems = [
  { id: 'home', label: 'Explore', icon: Search },
  { id: 'dashboard', label: 'Dashboard', icon: UserRound },
];

export default function Header({ user, activePage, onNavigate, onLogout }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-[#fbfaf7]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2 text-left"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-coral text-white">
            <Home size={18} aria-hidden="true" />
          </span>
          <span>
            <span className="block text-base font-semibold text-ink">StaySimple</span>
            <span className="hidden text-xs text-muted sm:block">Minimal stays marketplace</span>
          </span>
        </button>

        <nav className="flex items-center gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const disabled = item.id === 'dashboard' && !user;
            return (
              <button
                key={item.id}
                type="button"
                disabled={disabled}
                onClick={() => onNavigate(disabled ? 'auth' : item.id)}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium transition ${
                  activePage === item.id
                    ? 'bg-ink text-white'
                    : 'text-ink hover:bg-white disabled:text-muted'
                }`}
              >
                <Icon size={16} aria-hidden="true" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}

          {user ? (
            <>
              <span className="hidden items-center gap-2 rounded-full border border-line bg-white px-3 py-2 text-sm text-muted md:inline-flex">
                <Shield size={15} aria-hidden="true" />
                {user.role}
              </span>
              <button
                type="button"
                onClick={onLogout}
                className="grid h-10 w-10 place-items-center rounded-full text-ink hover:bg-white"
                title="Log out"
              >
                <LogOut size={18} aria-hidden="true" />
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate('auth')}
              className="h-10 rounded-full bg-ink px-4 text-sm font-semibold text-white hover:bg-ink/90"
            >
              Sign in
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
