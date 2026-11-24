import { ReactNode, useEffect, useState } from 'react';
import { getJson } from '../api/client.js';

type Props<T> = {
  title: string;
  description: string;
  path: string;
  emptyText: string;
  getItems: (data: T) => unknown[];
  renderItems: (items: unknown[]) => ReactNode;
};

export function CapabilityCard<T>({
  title,
  description,
  path,
  emptyText,
  getItems,
  renderItems,
}: Props<T>) {
  const [items, setItems] = useState<unknown[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setItems(null);
    setError('');

    getJson<T>(path)
      .then((data) => {
        if (active) setItems(getItems(data));
      })
      .catch((reason: unknown) => {
        if (active) {
          setError(reason instanceof Error ? reason.message : 'Unable to load data');
        }
      });

    return () => {
      active = false;
    };
  }, [path]);

  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {error ? (
          <p role="alert">Unable to load {title.toLowerCase()}: {error}</p>
        ) : items === null ? (
          <p role="status">Loading {title.toLowerCase()}...</p>
        ) : items.length === 0 ? (
          <p>{emptyText}</p>
        ) : (
          renderItems(items)
        )}
      </div>
    </section>
  );
}
