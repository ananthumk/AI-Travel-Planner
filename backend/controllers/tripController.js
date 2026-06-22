const asyncHandler = require('express-async-handler');
const Trip = require('../models/trip');
const { callGemini } = require('../utilis/geminiClient');
const {
  buildItineraryPrompt,
  buildRegenerateDayPrompt,
  sanitizeItinerary,
  sanitizePackingList,
} = require('../utilis/prompts');

const VALID_TIERS = ['Low', 'Medium', 'High'];

async function getOwnedTripOr404(tripId, userId, res) {
  const trip = await Trip.findOne({ _id: tripId, userId });
  if (!trip) {
    res.status(404);
    throw new Error('Trip not found');
  }
  return trip;
}

const createTrip = asyncHandler(async (req, res) => {
  const { destination, durationDays, budgetTier, interests } = req.body;

  if (!destination || !durationDays || !budgetTier) {
    res.status(400);
    throw new Error('destination, durationDays and budgetTier are required');
  }
  if (!VALID_TIERS.includes(budgetTier)) {
    res.status(400);
    throw new Error(`budgetTier must be one of: ${VALID_TIERS.join(', ')}`);
  }
  const safeInterests = Array.isArray(interests) ? interests : [];

  // Create a draft row first so user input is never lost even if the AI call fails
  const trip = await Trip.create({
    userId: req.user._id,
    destination,
    durationDays,
    budgetTier,
    interests: safeInterests,
    status: 'draft',
  });

  try {
    const { systemInstruction, userPrompt } = buildItineraryPrompt({
      destination,
      durationDays,
      budgetTier,
      interests: safeInterests,
    });

    const aiResult = await callGemini(systemInstruction, userPrompt);

    trip.itinerary = sanitizeItinerary(aiResult.itinerary);
    trip.hotels = aiResult.hotels || [];
    trip.estimatedBudget = aiResult.estimatedBudget || trip.estimatedBudget;
    trip.packingList = sanitizePackingList(aiResult.packingList);
    trip.status = 'generated';

    await trip.save();
  } catch (error) {
    trip.status = 'failed';
    await trip.save();
    res.status(502);
    throw new Error(`AI itinerary generation failed: ${error.message}`);
  }

  res.status(201).json(trip);
});


const getTrips = asyncHandler(async (req, res) => {
  const trips = await Trip.find({ userId: req.user._id }).sort({ createdAt: -1 });
  res.json(trips);
});

// @route   GET /api/trips/:id
// @access  Private
const getTripById = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOr404(req.params.id, req.user._id, res);
  res.json(trip);
});

// @route   PUT /api/trips/:id
// @access  Private
// @body    { itinerary?, packingList? }  (send only the array you changed)
// Whitelisted on purpose - never spread req.body directly onto the
// document, or a client could overwrite userId/estimatedBudget/etc.
const updateTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOr404(req.params.id, req.user._id, res);

  if (req.body.itinerary) {
    trip.itinerary = sanitizeItinerary(req.body.itinerary);
  }
  if (req.body.packingList) {
    trip.packingList = req.body.packingList.map((item) => ({
      item: item.item,
      category: item.category,
      isPacked: Boolean(item.isPacked),
      _id: item._id, // preserve existing ids so checkbox toggles don't create duplicates
    }));
  }

  const updated = await trip.save();
  res.json(updated);
});

// @route   DELETE /api/trips/:id
// @access  Private
const deleteTrip = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOr404(req.params.id, req.user._id, res);
  await trip.deleteOne();
  res.json({ message: 'Trip deleted' });
});

// @route   POST /api/trips/:id/regenerate-day
// @access  Private
// @body    { dayNumber: number, feedback: "Change Day 3 to outdoor hiking instead of shopping" }
// This is the one operation a plain PUT can't do, since it needs to call
// the LLM, not just persist client-supplied data.
const regenerateDay = asyncHandler(async (req, res) => {
  const trip = await getOwnedTripOr404(req.params.id, req.user._id, res);
  const { dayNumber, feedback } = req.body;

  if (!dayNumber || !feedback) {
    res.status(400);
    throw new Error('dayNumber and feedback are required');
  }

  const day = trip.itinerary.find((d) => d.dayNumber === Number(dayNumber));
  if (!day) {
    res.status(404);
    throw new Error(`Day ${dayNumber} not found in this trip`);
  }

  const { systemInstruction, userPrompt } = buildRegenerateDayPrompt({
    destination: trip.destination,
    budgetTier: trip.budgetTier,
    day: day.toObject(),
    feedback,
  });

  const aiResult = await callGemini(systemInstruction, userPrompt);
  const [sanitizedDay] = sanitizeItinerary([aiResult]);

  day.activities = sanitizedDay.activities;

  await trip.save();
  res.json(trip);
});

module.exports = {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
};