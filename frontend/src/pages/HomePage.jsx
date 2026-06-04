import React from 'react';
import { Search, SlidersHorizontal } from 'lucide-react';
import EmptyState from '../components/EmptyState';
import ListingCard from '../components/ListingCard';

export default function HomePage({
  filters,
  setFilters,
  listings,
  loading,
  usingDemoData,
  apiUnavailable,
  onSearch,
  onSelectListing,
}) {
  return (
    <main>
      <section className="border-b border-line bg-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="flex flex-col justify-center">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-forest">MERN MVP</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
              Find a clean place to stay, without the clutter.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted">
              Search by city and price, inspect details, then request a booking that waits for host confirmation.
            </p>
          </div>
          <form onSubmit={onSearch} className="self-end rounded-lg border border-line bg-[#fbfaf7] p-4 shadow-soft">
            <div className="grid gap-3 sm:grid-cols-[1fr_0.8fr_0.8fr_auto]">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">City</span>
                <input
                  value={filters.city}
                  onChange={(event) => setFilters({ ...filters, city: event.target.value })}
                  placeholder="Rabat"
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Min</span>
                <input
                  type="number"
                  min="0"
                  value={filters.minPrice}
                  onChange={(event) => setFilters({ ...filters, minPrice: event.target.value })}
                  placeholder="40"
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">Max</span>
                <input
                  type="number"
                  min="0"
                  value={filters.maxPrice}
                  onChange={(event) => setFilters({ ...filters, maxPrice: event.target.value })}
                  placeholder="120"
                  className="focus-ring mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-sm"
                />
              </label>
              <button
                type="submit"
                className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-md bg-coral px-5 text-sm font-semibold text-white hover:bg-coral/90"
              >
                <Search size={17} aria-hidden="true" />
                Search
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-ink">Available homes</h2>
            <p className="mt-1 text-sm text-muted">
              {usingDemoData
                ? 'Backend unavailable. Showing filtered demo listings only.'
                : `${listings.length} real listing(s) from MongoDB`}
            </p>
          </div>
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm ${
              apiUnavailable ? 'border-amber-200 bg-amber-50 text-amber-800' : 'border-line bg-white text-muted'
            }`}
          >
            <SlidersHorizontal size={15} aria-hidden="true" />
            {apiUnavailable ? 'Demo mode' : 'City and price filters'}
          </span>
        </div>

        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-80 animate-pulse rounded-lg bg-white" />
            ))}
          </div>
        ) : listings.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard key={listing._id} listing={listing} onSelect={onSelectListing} />
            ))}
          </div>
        ) : (
          <EmptyState title="No homes found" message="Try a different city or widen the price range." />
        )}
      </section>
    </main>
  );
}
