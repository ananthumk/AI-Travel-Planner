import { useState } from 'react';
import { TIME_OF_DAY } from '../data/constants';

const EMPTY_ACTIVITY = { title: '', description: '', estimatedCostINR: 0, timeOfDay: 'Morning' };

export default function DayCard({ day, onAddActivity, onRemoveActivity, onRegenerateDay }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [newActivity, setNewActivity] = useState(EMPTY_ACTIVITY);
  const [busy, setBusy] = useState(false);


  const [error, setError] = useState('');
  const [retryFn, setRetryFn] = useState(null);

  const runAction = async (actionFn) => {
    setBusy(true);
    setError('');
    try {
      await actionFn();
      setRetryFn(null);
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Something went wrong.');
      setRetryFn(() => actionFn);
    } finally {
      setBusy(false);
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    const payload = { ...newActivity, estimatedCostINR: Number(newActivity.estimatedCostINR) || 0 };
    runAction(async () => {
      await onAddActivity(day.dayNumber, payload);
      setNewActivity(EMPTY_ACTIVITY);
      setShowAddForm(false);
    });
  };

  const handleRemove = (activityId) => {
    runAction(() => onRemoveActivity(day.dayNumber, activityId));
  };

  const handleRegenerate = (e) => {
    e.preventDefault();
    const feedbackText = feedback;
    runAction(async () => {
      await onRegenerateDay(day.dayNumber, feedbackText);
      setFeedback('');
      setShowRegenerateForm(false);
    });
  };

  return (
    <div className="bg-[#f5ebe0] border-0 rounded-2xl p-6">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-display text-xl font-bold text-deep">Day {day.dayNumber}</h3>
        <button
          onClick={() => setShowRegenerateForm((s) => !s)}
          className="text-sm bg-[#b58463] text-deep font-medium border border-sandline rounded-full px-3 py-1 hover:border-deep"
        >
          ↻ Regenerate
        </button>
      </div>

      {showRegenerateForm && (
        <form onSubmit={handleRegenerate} className="mb-4 flex gap-2">
          <input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g. Replace shopping with a hiking trail"
            required
            className="flex-1 border border-sandline rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coral"
          />
          <button disabled={busy} className="bg-deep text-white text-sm px-4 rounded-lg disabled:opacity-60">
            {busy ? 'Asking AI…' : 'Apply'}
          </button>
        </form>
      )}

      <ul className="space-y-3">
        {day.activities.map((activity) => (
          <li
            key={activity._id}
            className="flex rounded-xl  p-3 bg-white items-start justify-between gap-3 border-0 pt-3"
          >
            <div>
              <p className="text-md font-semibold text-ink">
                <span className="text-white text-sm font-medium p-1 rounded-lg bg-[#645452] mr-2">{activity.timeOfDay}</span>
                {activity.title}
              </p>
              <p className="text-sm text-ink/60">{activity.description}</p>
              {activity.estimatedCostINR > 0 && (
                <p className="text-xs text-ink/40 mt-0.5">₹{activity.estimatedCostINR}</p>
              )}
            </div>
            <button
              onClick={() => handleRemove(activity._id)}
              disabled={busy}
              className="text-ink/30 hover:text-red-500 text-sm shrink-0 disabled:opacity-40"
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      {/* Inline error + retry for whichever action (add/remove/regenerate) just failed */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg px-4 py-3 flex items-center justify-between gap-3">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          <button
            onClick={() => retryFn && runAction(retryFn)}
            disabled={busy}
            className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 py-1.5 rounded-full font-medium shrink-0 disabled:opacity-60"
          >
            {busy ? 'Retrying…' : '↻ Retry'}
          </button>
        </div>
      )}

      {showAddForm ? (
        <form onSubmit={handleAdd} className="mt-4 grid grid-cols-2 gap-2 bg-sand/60 p-3 rounded-lg">
          <input
            placeholder="Title"
            required
            value={newActivity.title}
            onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
            className="col-span-2 border border-sandline rounded px-2 py-1.5 text-sm"
          />
          <input
            placeholder="Description"
            value={newActivity.description}
            onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
            className="col-span-2 border border-sandline rounded px-2 py-1.5 text-sm"
          />
          <select
            value={newActivity.timeOfDay}
            onChange={(e) => setNewActivity({ ...newActivity, timeOfDay: e.target.value })}
            className="col-span-1 border border-sandline rounded px-2 py-1.5 text-sm"
          >
            {TIME_OF_DAY.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <input
            type="number"
            placeholder="Cost (₹)"
            value={newActivity.estimatedCostINR}
            onChange={(e) => setNewActivity({ ...newActivity, estimatedCostINR: e.target.value })}
            className="col-span-1 border border-sandline rounded px-2 py-1.5 text-sm"
          />
          <div className="col-span-2 flex gap-2">
            <button disabled={busy} className="bg-coral text-white text-sm px-4 py-1.5 rounded-lg disabled:opacity-60">
              {busy ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-ink/50">
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button onClick={() => setShowAddForm(true)} className="bg-[#b58463] p-2 rounded-3xl mt-4 text-sm text-coral font-medium">
          + Add activity
        </button>
      )}
    </div>
  );
}
