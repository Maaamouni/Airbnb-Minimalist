import React from 'react';
import { useEffect, useState } from 'react';
import { Check, Home, Plus, X } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import { bookingsApi, listingsApi, usersApi } from '../services/api';
import { formatCity, formatMoney } from '../utils/format';

const initialListing = {
  title: '',
  description: '',
  price: '',
  city: '',
  images: '',
};

export default function Dashboard({ user }) {
  const [listingForm, setListingForm] = useState(initialListing);
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [status, setStatus] = useState({ loading: false, error: '', message: '' });

  const isHost = ['host', 'admin'].includes(user.role);
  const isAdmin = user.role === 'admin';

  const loadDashboard = async () => {
    setStatus((current) => ({ ...current, loading: true, error: '' }));
    try {
      const [bookingPayload, usersPayload] = await Promise.all([
        isHost ? bookingsApi.host() : bookingsApi.user(),
        isAdmin ? usersApi.all() : Promise.resolve({ data: [] }),
      ]);
      setBookings(bookingPayload.data || []);
      setUsers(usersPayload.data || []);
      setStatus({ loading: false, error: '', message: '' });
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: '' });
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [user.id, user.role]);

  const createListing = async (event) => {
    event.preventDefault();
    setStatus({ loading: true, error: '', message: '' });
    try {
      await listingsApi.create({
        ...listingForm,
        price: Number(listingForm.price),
        images: listingForm.images
          .split(',')
          .map((image) => image.trim())
          .filter(Boolean),
      });
      setListingForm(initialListing);
      setStatus({ loading: false, error: '', message: 'Listing created.' });
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: '' });
    }
  };

  const updateBooking = async (id, nextStatus) => {
    setStatus({ loading: true, error: '', message: '' });
    try {
      await bookingsApi.update(id, nextStatus);
      await loadDashboard();
      setStatus({ loading: false, error: '', message: `Booking ${nextStatus}.` });
    } catch (error) {
      setStatus({ loading: false, error: error.message, message: '' });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">{user.role}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Signed in as {user.name}</p>
      </div>

      {(status.error || status.message) && (
        <div
          className={`mb-5 rounded-md px-4 py-3 text-sm ${
            status.error ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'
          }`}
        >
          {status.error || status.message}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        {isHost && (
          <section className="rounded-lg border border-line bg-white p-5">
            <div className="mb-5 flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-coral/10 text-coral">
                <Plus size={18} aria-hidden="true" />
              </span>
              <h2 className="text-xl font-semibold text-ink">Create listing</h2>
            </div>

            <form onSubmit={createListing} className="space-y-4">
              {[
                ['title', 'Title'],
                ['city', 'City'],
                ['price', 'Price per night'],
                ['images', 'Image URLs, comma-separated'],
              ].map(([key, label]) => (
                <label key={key} className="block">
                  <span className="text-sm font-medium text-ink">{label}</span>
                  <input
                    required={key !== 'images'}
                    type={key === 'price' ? 'number' : 'text'}
                    min={key === 'price' ? '1' : undefined}
                    value={listingForm[key]}
                    onChange={(event) => setListingForm({ ...listingForm, [key]: event.target.value })}
                    className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
                  />
                </label>
              ))}
              <label className="block">
                <span className="text-sm font-medium text-ink">Description</span>
                <textarea
                  required
                  minLength="20"
                  rows="4"
                  value={listingForm.description}
                  onChange={(event) => setListingForm({ ...listingForm, description: event.target.value })}
                  className="focus-ring mt-2 w-full rounded-md border border-line px-3 py-3 text-sm"
                />
              </label>
              <button
                type="submit"
                disabled={status.loading}
                className="h-11 w-full rounded-md bg-ink text-sm font-semibold text-white hover:bg-ink/90 disabled:opacity-60"
              >
                Publish listing
              </button>
            </form>
          </section>
        )}

        <section className="rounded-lg border border-line bg-white p-5">
          <div className="mb-5 flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-forest/10 text-forest">
              <Home size={18} aria-hidden="true" />
            </span>
            <h2 className="text-xl font-semibold text-ink">{isHost ? 'Reservation requests' : 'My reservations'}</h2>
          </div>

          {bookings.length ? (
            <div className="space-y-3">
              {bookings.map((booking) => (
                <div key={booking._id} className="rounded-lg border border-line p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-ink">{booking.listing?.title || 'Listing'}</h3>
                      <p className="mt-1 text-sm text-muted">
                        {formatCity(booking.listing?.city)} · {formatMoney(booking.totalPrice)}
                      </p>
                    </div>
                    <span className="rounded-full bg-soft px-3 py-1 text-xs font-semibold capitalize text-ink">
                      {booking.status}
                    </span>
                  </div>
                  {isHost && booking.status === 'pending' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        onClick={() => updateBooking(booking._id, 'confirmed')}
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-forest px-3 text-sm font-semibold text-white"
                      >
                        <Check size={15} aria-hidden="true" />
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() => updateBooking(booking._id, 'cancelled')}
                        className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm font-semibold text-ink"
                      >
                        <X size={15} aria-hidden="true" />
                        Refuse
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No reservations yet" message="Reservation activity will appear here once guests request dates." />
          )}
        </section>
      </div>

      {isAdmin && (
        <section className="mt-6 rounded-lg border border-line bg-white p-5">
          <h2 className="text-xl font-semibold text-ink">Users</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {users.map((item) => (
              <div key={item._id || item.id} className="rounded-lg border border-line p-4">
                <p className="font-semibold text-ink">{item.name}</p>
                <p className="mt-1 text-sm text-muted">{item.email}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-forest">{item.role}</p>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
