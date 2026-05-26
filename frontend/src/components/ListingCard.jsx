import React from 'react';
import { MapPin, Star } from 'lucide-react';
import { formatCity, formatMoney } from '../utils/format';

export default function ListingCard({ listing, onSelect }) {
  const image = listing.images?.[0];

  return (
    <article className="group overflow-hidden rounded-lg border border-line bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-soft">
      <button type="button" onClick={() => onSelect(listing)} className="block w-full text-left">
        <div className="aspect-[4/3] bg-soft">
          {image ? (
            <img
              src={image}
              alt={listing.title}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="grid h-full place-items-center text-sm text-muted">No photo</div>
          )}
        </div>
        <div className="space-y-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="line-clamp-1 text-base font-semibold text-ink">{listing.title}</h3>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                <MapPin size={14} aria-hidden="true" />
                {formatCity(listing.city)}
              </p>
            </div>
            <span className="flex items-center gap-1 text-sm font-medium text-ink">
              <Star size={14} fill="currentColor" aria-hidden="true" />
              4.8
            </span>
          </div>
          <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted">{listing.description}</p>
          <p className="text-sm text-muted">
            <span className="text-base font-semibold text-ink">{formatMoney(listing.price)}</span> night
          </p>
        </div>
      </button>
    </article>
  );
}
