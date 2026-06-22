import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import api from '../api/client';

export default function DashboardPage() {
  const [status, setStatus] = useState('loading');
  const [trips, setTrips] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTrips = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      console.log('Fetching trips from API...:' , api.defaults.baseURL);
      const { data } = await api.get('/trips');
      setTrips(data);
      console.log('data from dashboard api: ',data)
      setStatus('success');
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || err.message || 'Could not reach the server.'
      );
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);



  const handleDelete = async (id) => {
    if (!confirm('Delete this trip?')) return;
    try {
      await api.delete(`/trips/${id}`);
      setTrips((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Could not delete this trip. Please try again.');
    }
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-12">


        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-deep">Your trips</h1>
            <p className="text-ink/60">Saved itineraries, ready to revisit or keep editing.</p>
          </div>
          <Link
            to="/trip/new"
            className="bg-[#b58463] hover:bg-coral-light text-white px-5 py-2.5 rounded-full font-medium transition-colors"
          >
            + Plan a new trip
          </Link>
        </div>

        {status === 'loading' && <LoadingSpinner label="Loading your trips…" />}

        {status === 'error' && (
          <ErrorState message={errorMessage} onRetry={fetchTrips} />
        )}

        {status === 'success' && trips.length === 0 && (
          <div className="border border-dashed border-sandline rounded-2xl p-12 text-center">
            <p className="text-ink/60 mb-4">No trips yet. Your first AI-planned itinerary is one click away.</p>
            <Link to="/trip/new" className="text-coral font-medium">
              Create your first trip →
            </Link>
          </div>
        )}

        {status === 'success' && trips.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <div
                key={trip._id}
                className="bg-white border border-sandline rounded-2xl p-6 flex flex-col justify-between hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-coral font-medium mb-1">
                    {trip.status} · {trip.budgetTier}
                  </p>
                  <h2 className="font-display text-xl font-semibold text-deep mb-1">{trip.destination}</h2>
                  <p className="text-sm text-ink/60">{trip.durationDays} days</p>
                  <p className="text-sm text-ink/60 mt-1">
                    Est. total: ₹{trip.estimatedBudget?.total ?? '—'}
                  </p>
                </div>
                <div className="flex items-center justify-between mt-6">
                  <Link to={`/trip/${trip._id}`} className="text-deep font-medium hover:text-coral">
                    View itinerary →
                  </Link>
                  <button onClick={() => handleDelete(trip._id)} className="text-ink/40 hover:text-red-500 text-sm">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
