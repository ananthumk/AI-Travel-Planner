// utils/prompts.js
const ALLOWED_TIMES = ['Morning', 'Afternoon', 'Evening'];
const ALLOWED_PACKING_CATEGORIES = ['Documents', 'Clothing', 'Gear', 'Other'];

function sanitizeItinerary(itinerary = []) {
  return itinerary.map((day, idx) => ({
    dayNumber: day.dayNumber || idx + 1,
    activities: (day.activities || []).map((act) => ({
      title: act.title || 'Untitled activity',
      description: act.description || '',
      estimatedCostINR: Number(act.estimatedCostINR) || 0,
      timeOfDay: ALLOWED_TIMES.includes(act.timeOfDay) ? act.timeOfDay : 'Afternoon',
    })),
  }));
}

function sanitizePackingList(packingList = []) {
  return packingList.map((item) => ({
    item: item.item || 'Item',
    category: ALLOWED_PACKING_CATEGORIES.includes(item.category) ? item.category : 'Other',
    isPacked: false,
  }));
}

function buildItineraryPrompt({ destination, durationDays, budgetTier, interests }) {
  const systemInstruction = `You are Trao, an expert travel planner AI. You ALWAYS respond with a single valid JSON object and nothing else - no markdown, no commentary, no code fences. You produce realistic, locally-accurate day-by-day itineraries with believable cost estimates in INDIAN RUPEES (INR).`;

  const userPrompt = `Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
Budget preference: ${budgetTier} (Low, Medium, or High).
Interests: ${interests && interests.length ? interests.join(', ') : 'general sightseeing'}.
ALL costs must be in Indian Rupees (INR), as plain numbers with no currency symbol or commas (e.g. 1500, not "₹1,500").

Return ONLY a JSON object with exactly this shape:
{
  "itinerary": [
    { "dayNumber": 1, "activities": [
      { "title": "...", "description": "...", "estimatedCostINR": 0, "timeOfDay": "Morning" }
    ]}
  ],
  "hotels": [
    { "name": "...", "tier": "Budget|Mid-range|Luxury", "estimatedCostNightINR": 0, "rating": "4.5/5" }
  ],
  "estimatedBudget": { "transport": 0, "accommodation": 0, "food": 0, "activities": 0, "total": 0 },
  "packingList": [
    { "item": "...", "category": "Documents|Clothing|Gear|Other", "isPacked": false }
  ]
}

Rules:
- itinerary must have EXACTLY ${durationDays} day objects, dayNumber 1 to ${durationDays}.
- "timeOfDay" must be EXACTLY one of "Morning", "Afternoon", or "Evening" - no other wording.
- "category" in packingList must be EXACTLY one of "Documents", "Clothing", "Gear", or "Other".
- ALL money values (estimatedCostINR, estimatedCostNightINR, estimatedBudget.*) must be realistic INR amounts for ${destination}, scaled appropriately if it's an international destination vs a domestic Indian one.
- estimatedBudget.total must equal the sum of transport + accommodation + food + activities.
- Suggest 3 hotels appropriate for the "${budgetTier}" budget tier.
- packingList should account for both ${destination}'s typical climate for this kind of trip and the specific activities planned.
- Costs should roughly track the ${budgetTier} tier (Low = hostels/street food/public transport, Medium = 3-star hotels/casual dining, High = 4-5 star hotels/fine dining/private transport).`;

  return { systemInstruction, userPrompt };
}

function buildRegenerateDayPrompt({ destination, budgetTier, day, feedback }) {
  const systemInstruction = `You are Trao, an expert travel planner AI. You ALWAYS respond with a single valid JSON object and nothing else - no markdown, no commentary. You revise a single day of an itinerary based on user feedback while keeping cost estimates in Indian Rupees (INR) realistic for the stated budget tier.`;

  const userPrompt = `Destination: ${destination}
Budget tier: ${budgetTier}
Current day to revise: ${JSON.stringify(day)}
User feedback / requested change: "${feedback}"

Rewrite this single day to satisfy the feedback. All costs must be in INR (plain numbers, no symbol). Return ONLY a JSON object with exactly this shape (keep the same dayNumber):
{
  "dayNumber": ${day.dayNumber},
  "activities": [
    { "title": "...", "description": "...", "estimatedCostINR": 0, "timeOfDay": "Morning" }
  ]
}
"timeOfDay" must be EXACTLY one of "Morning", "Afternoon", or "Evening".`;

  return { systemInstruction, userPrompt };
}

module.exports = {
  buildItineraryPrompt,
  buildRegenerateDayPrompt,
  sanitizeItinerary,
  sanitizePackingList,
};