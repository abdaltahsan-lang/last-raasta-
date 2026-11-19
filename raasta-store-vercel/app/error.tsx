"use client";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div style={{ maxWidth: 520 }}>
    <h1>Something went wrong</h1>
    <p>The page could not load. Please try again in a moment.</p>
    <p className="mu">Store owner: open <b>/api/health</b> on this site to see what is not set up.</p>
    <button className="btn" onClick={reset}>Try again</button>
  </div>;
}
