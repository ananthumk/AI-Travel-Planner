import { useState } from 'react';

const CATEGORY_ORDER = ['Documents', 'Clothing', 'Gear', 'Other'];

export default function PackingChecklist({ packingList, onToggle }) {
  
  const [failedItemId, setFailedItemId] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [pendingItemId, setPendingItemId] = useState(null);

  const handleToggle = async (item, checked) => {
    setPendingItemId(item._id);
    setFailedItemId(null);
    try {
      await onToggle(item._id, checked);
    } catch (err) {
      setFailedItemId(item._id);
      setErrorMessage(err?.response?.data?.message || err.message || 'Could not save this change.');
    } finally {
      setPendingItemId(null);
    }
  };

  if (!packingList || packingList.length === 0) {
    return (
      <div className="bg-white border border-sandline rounded-2xl p-6 text-center text-ink/50">
        No packing list yet for this trip.
      </div>
    );
  }

  const grouped = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    items: packingList.filter((i) => i.category === cat),
  })).filter((g) => g.items.length > 0);

  return (
    <div className="bg-white border border-sandline rounded-2xl p-6">
      <h3 className="font-display text-xl font-semibold text-deep mb-4">Packing checklist</h3>

      {grouped.map((group) => (
        <div key={group.category} className="mb-4">
          <p className="text-xs uppercase tracking-wide text-ink/40 font-medium mb-2">{group.category}</p>
          <ul className="space-y-2">
            {group.items.map((item) => (
              <li key={item._id}>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={item.isPacked}
                    disabled={pendingItemId === item._id}
                    onChange={(e) => handleToggle(item, e.target.checked)}
                    className="mt-1 accent-coral disabled:opacity-50"
                  />
                  <p className={`text-sm ${item.isPacked ? 'line-through text-ink/40' : 'text-ink'}`}>
                    {item.item}
                  </p>
                </div>
                {failedItemId === item._id && (
                  <div className="ml-7 mt-1 flex items-center gap-2">
                    <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
                    <button
                      onClick={() => handleToggle(item, !item.isPacked)}
                      className="text-xs text-red-700 underline font-medium shrink-0"
                    >
                      ↻ Retry
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
