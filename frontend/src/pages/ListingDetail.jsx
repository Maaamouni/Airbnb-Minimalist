import React from 'react';
import { ArrowLeft, CalendarDays, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import { bookingsApi } from '../services/api';
import { formatCity, formatMoney, nightsBetween } from '../utils/format';

export default function ListingDetail({ listing, user, onBack, onRequireAuth }) {
  const [dates, setDates] = useState({ startDate: '', endDate: '' });
  const [status, setStatus] = useState({ loading: false, message: '', error: '' });
  const nights = useMemo(() => nightsBetween(dates.startDate, dates.endDate), [dates]);
  const total = nights * Number(listing.price || 0);
  const isDemo = listing._id?.startsWith('demo-');

  const book = async (event) => {
    event.preventDefault();
    if (!user) {
      onRequireAuth();
      return;
    }
    if (isDemo) {
      setStatus({ loading: false, message: '', error: 'Demo listings cannot be booked. Create a real listing first.' });
      return;
    }
    setStatus({ loading: true, message: '', error: '' });
    try {
      const payload = await bookingsApi.create({
        listingId: listing._id,
        startDate: dates.startDate,
        endDate: dates.endDate,
      });
      setStatus({ loading: false, message: payload.message, error: '' });
    } catch (error) {
      setStatus({ loading: false, message: '', error: error.message });
    }
  };

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <button type="button" onClick={onBack} className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-ink">
        <ArrowLeft size={17} aria-hidden="true" />
        Back to homes
      </button>

      <section className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <div className="overflow-hidden rounded-lg border border-line bg-white">
            <div className="aspect-[16/10] bg-soft">
              {listing.images?.[0] ? (
                <img src={listing.images[0]} alt={listing.title} className="h-full w-full object-cover" />
              ) : (
                <div className="grid h-full place-items-center text-muted">No photo</div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <p className="flex items-center gap-2 text-sm text-muted">
              <MapPin size={16} aria-hidden="true" />
              {formatCity(listing.city)}
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-ink">{listing.title}</h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-muted">{listing.description}</p>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {['Wi-Fi', 'Kitchen', 'Flexible dates'].map((item) => (
              <div key={item} className="rounded-lg border border-line bg-white p-4 text-sm font-medium text-ink">
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="h-fit rounded-lg border border-line bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-end justify-between gap-3">
            <p className="text-sm text-muted">
              <span className="text-2xl font-semibold text-ink">{formatMoney(listing.price)}</span> night
            </p>
            <span className="text-sm text-muted">Host: {listing.owner?.name || 'Host'}</span>
          </div>

          <form onSubmit={book} className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-ink">Start</span>
                <input
                  required
                  type="date"
                  value={dates.startDate}
                  onChange={(event) => setDates({ ...dates, startDate: event.target.value })}
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-ink">End</span>
                <input
                  required
                  type="date"
                  value={dates.endDate}
                  onChange={(event) => setDates({ ...dates, endDate: event.target.value })}
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-line px-3 text-sm"
                />
              </label>
            </div>

            <div className="rounded-md bg-soft p-4 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={16} aria-hidden="true" />
                  {nights} night(s)
                </span>
                <strong className="text-ink">{formatMoney(total)}</strong>
              </div>
            </div>

            {status.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{status.error}</p>}
            {status.message && <p className="rounded-md bg-green-50 px-3 py-2 text-sm text-green-700">{status.message}</p>}

            <button
              type="submit"
              disabled={status.loading || !nights}
              className="h-11 w-full rounded-md bg-coral text-sm font-semibold text-white hover:bg-coral/90 disabled:opacity-60"
            >
              {status.loading ? 'Sending request...' : 'Request booking'}
            </button>
          </form>
        </aside>
      </section>
    </main>
  );
}
