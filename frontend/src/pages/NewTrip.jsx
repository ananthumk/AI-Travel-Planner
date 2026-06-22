import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import TripForm from '../components/TripForm';
import api from '../api/client';

export default function NewTripPage() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [lastFormData, setLastFormData] = useState(null);

  const handleSubmit = async (formData) => {
    setLastFormData(formData);
    setSubmitting(true);
    setError('');
    try {
      const { data } = await api.post('/trips', formData);
      navigate(`/trip/${data._id}`);
    } catch (err) {
      setError(
        err?.response?.data?.message || err.message || 'Could not generate the itinerary. Try again.'
      );
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    if (lastFormData) handleSubmit(lastFormData);
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-12">
        <h1 className="font-display text-3xl font-bold text-deep mb-1">Plan a new trip</h1>
        <p className="text-ink/60 mb-8">
          Tell the AI where you're going and your budget tier — it builds the full day-by-day plan.
        </p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={handleRetry}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-full font-medium shrink-0 disabled:opacity-60"
            >
              {submitting ? 'Retrying…' : '↻ Retry'}
            </button>
          </div>
        )}

        <TripForm onSubmit={handleSubmit} submitting={submitting} />
      </main>
    </div>
  );
}
