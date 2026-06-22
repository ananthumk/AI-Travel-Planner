import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DayCard from '../components/DayCard';
import PackingChecklist from '../components/PackingChecklist';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorState from '../components/ErrorState';
import api from '../api/client';

export default function TripDetailPage() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const fetchTrip = async () => {
    setStatus('loading');
    setErrorMessage('');
    try {
      const { data } = await api.get(`/trips/${id}`);
      setTrip(data);
      setStatus('success');
    } catch (err) {
      setErrorMessage(
        err?.response?.data?.message || err.message || 'Could not load this trip.'
      );
      setStatus('error');
    }
  };

  useEffect(() => {
    fetchTrip();
  }, [id]);



  const saveItinerary = async (updatedItinerary) => {
    const { data } = await api.put(`/trips/${id}`, { itinerary: updatedItinerary });
    setTrip(data);
  };

  const savePackingList = async (updatedPackingList) => {
    const { data } = await api.put(`/trips/${id}`, { packingList: updatedPackingList });
    setTrip(data);
  };

  const handleAddActivity = async (dayNumber, activity) => {
    const updated = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber ? { ...day, activities: [...day.activities, activity] } : day
    );
    await saveItinerary(updated);
  };

  const handleRemoveActivity = async (dayNumber, activityId) => {
    const updated = trip.itinerary.map((day) =>
      day.dayNumber === dayNumber
        ? { ...day, activities: day.activities.filter((a) => a._id !== activityId) }
        : day
    );
    await saveItinerary(updated);
  };

  const handleRegenerateDay = async (dayNumber, feedback) => {
    const { data } = await api.post(`/trips/${id}/regenerate-day`, { dayNumber, feedback });
    setTrip(data);
  };

  const handleTogglePacking = async (itemId, isPacked) => {
    const updated = trip.packingList.map((item) => (item._id === itemId ? { ...item, isPacked } : item));
    await savePackingList(updated);
  };

  if (status === 'loading') {
    return (
      <div>
        <Navbar />
        <LoadingSpinner label="Loading trip…" />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div>
        <Navbar />
        <main className="max-w-2xl mx-auto px-6 py-12">
          <ErrorState message={errorMessage} onRetry={fetchTrip} />
        </main>
      </div>
    );
  }

  // status === 'success' from here on - `trip` is guaranteed to be set
  const { transport = 0, accommodation = 0, food = 0, activities = 0, total = 0 } = trip.estimatedBudget || {};

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12">

        <div className="mb-8">
          <p className="text-xs uppercase tracking-wide text-coral font-medium mb-1">
            <span className='p-2 bg-[#adb5bd] rounded-xl font-bold'>{trip.durationDays} days</span> · <span>{trip.budgetTier} budget</span>
          </p>
          <h1 className="font-display text-4xl font-bold text-deep">{trip.destination}</h1>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-4">
          {[
            ['Accommodation', accommodation],
            ['Food', food],
            ['Activities', activities],
            ['Transport', transport],
          ].map(([label, value]) => (
            <div key={label} className="bg-white border border-sandline rounded-2xl p-4">
              <p className="text-sm text-ink/50">{label}</p>
              <p className="font-display text-lg font-bold text-deep">₹{value}</p>
            </div>
          ))}
        </div>
        <p className="text-md text-ink/50 mb-10">
          Estimated total: <span className="font-semibold text-ink">₹{total}</span>
        </p>

        {trip.hotels?.length > 0 && (
          <div className="mb-10">
            <h2 className="font-display text-xl font-semibold text-deep mb-4">Suggested stays</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {trip.hotels.map((hotel, idx) => (
                <div key={idx} className="bg-[#f5ebe0] border border-sandline rounded-2xl p-4">
                  <p className="font-semibold text-md text-ink">{hotel.name}</p>
                  <p className="text-sm text-coral">{hotel.tier} · ⭐ {hotel.rating}</p>
                  <p className="text-sm font-medium text-ink/60 mt-1">₹{hotel.estimatedCostNightINR}/night</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="font-display text-xl font-semibold text-deep mb-4">Day-by-day itinerary</h2>
        <div className="space-y-6 mb-10">
          {trip.itinerary.map((day) => (
            <DayCard
              key={day._id || day.dayNumber}
              day={day}
              onAddActivity={handleAddActivity}
              onRemoveActivity={handleRemoveActivity}
              onRegenerateDay={handleRegenerateDay}
            />
          ))}
        </div>

        <PackingChecklist packingList={trip.packingList} onToggle={handleTogglePacking} />
      </main>
    </div>
  );
}
