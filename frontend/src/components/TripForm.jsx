import { useState } from 'react';
import { BUDGET_TIERS, INTEREST_OPTIONS } from '../data/constants';

export default function TripForm({ onSubmit, submitting }) {
  const [form, setForm] = useState({
    destination: '',
    durationDays: 3,
    budgetTier: 'Medium',
    interests: [],
  });

  const togglePreference = (pref) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(pref)
        ? prev.interests.filter((p) => p !== pref)
        : [...prev.interests, pref],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...form, durationDays: Number(form.durationDays) });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-sandline rounded-2xl p-8">
      <div>
        <label className="block text-sm font-medium mb-1">Destination</label>
        <input
          name="destination"
          required
          placeholder="e.g. Kerala, India"
          value={form.destination}
          onChange={handleChange}
          className="w-full border border-sandline rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Duration (days)</label>
        <input
          type="number"
          min={1}
          max={30}
          name="durationDays"
          required
          value={form.durationDays}
          onChange={handleChange}
          className="w-full border border-sandline rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-coral"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Budget tier</label>
        <div className="flex gap-3">
          {BUDGET_TIERS.map((tier) => (
            <button
              type="button"
              key={tier}
              onClick={() => setForm((prev) => ({ ...prev, budgetTier: tier }))}
              className={`px-4 py-2 rounded-full text-sm border transition-colors ${
                form.budgetTier === tier
                  ? 'bg-[#b58463] text-white border-deep'
                  : 'border-sandline text-ink/70 hover:border-deep'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Interests</label>
        <div className="flex flex-wrap gap-2">
          {INTEREST_OPTIONS.map((pref) => (
            <button
              type="button"
              key={pref}
              onClick={() => togglePreference(pref)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                form.interests.includes(pref)
                  ? 'bg-[#b58463] text-white border-coral'
                  : 'border-sandline text-ink/70 hover:border-coral'
              }`}
            >
              {pref}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-[#c4bbaf] hover:bg-coral-light text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-60"
      >
        {submitting ? 'Asking the AI to plan your trip…' : 'Generate itinerary'}
      </button>
    </form>
  );
}
