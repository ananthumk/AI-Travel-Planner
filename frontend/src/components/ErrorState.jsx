
export default function ErrorState({ message, onRetry, retrying }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
      <p className="text-red-700 font-semibold mb-1">Something went wrong</p>
      <p className="text-red-600 text-sm mb-4">{message || 'Please try again.'}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          disabled={retrying}
          className="bg-red-600 hover:bg-red-700 text-white text-sm px-5 py-2 rounded-full font-medium transition-colors disabled:opacity-60"
        >
          {retrying ? 'Retrying…' : '↻ Try again'}
        </button>
      )}
    </div>
  );
}
