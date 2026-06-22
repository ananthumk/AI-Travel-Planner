export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink/50">
      <div className="w-8 h-8 border-3 border-sandline border-t-coral rounded-full animate-spin" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
