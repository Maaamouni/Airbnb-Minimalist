import React from 'react';
export default function EmptyState({ title, message }) {
  return (
    <div className="rounded-lg border border-dashed border-line bg-white p-8 text-center">
      <h3 className="text-lg font-semibold text-ink">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{message}</p>
    </div>
  );
}
