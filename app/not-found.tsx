import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-black text-zinc-100 font-sans">
      <div className="flex h-8 w-8 items-center justify-center rounded-xs bg-zinc-900 border border-zinc-800 text-zinc-100 font-mono text-xs font-bold mb-3">
        Ø
      </div>
      <h2 className="text-lg font-semibold">404 — Not Found</h2>
      <p className="mt-1 text-xs text-zinc-400">The requested page does not exist.</p>
      <Link
        href="/"
        className="mt-4 rounded-md border border-zinc-800 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-200 hover:bg-zinc-850 hover:text-white transition-colors"
      >
        Return to Operator
      </Link>
    </div>
  );
}
