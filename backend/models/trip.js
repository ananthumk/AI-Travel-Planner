const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: '' },
    estimatedCostINR: { type: Number, default: 0 },
    timeOfDay: {
      type: String,
      enum: ['Morning', 'Afternoon', 'Evening'],
      default: 'Afternoon',
    },
  },
  { _id: true }
);

const daySchema = new mongoose.Schema(
  {
    dayNumber: { type: Number, required: true },
    activities: [activitySchema],
  },
  { _id: true }
);

const hotelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    tier: { type: String },
    estimatedCostNightINR: { type: Number },
    rating: { type: String },
  },
  { _id: false }
);

const packingItemSchema = new mongoose.Schema(
  {
    item: { type: String, required: true },
    category: {
      type: String,
      enum: ['Documents', 'Clothing', 'Gear', 'Other'],
      default: 'Other',
    },
    isPacked: { type: Boolean, default: false },
  },
  { _id: true }
);

const tripSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    destination: { type: String, required: true },
    durationDays: { type: Number, required: true },
    budgetTier: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      required: true,
    },
    interests: [{ type: String }],

    itinerary: [daySchema],
    hotels: [hotelSchema],

    // All four fields + total are in INR now
    estimatedBudget: {
      transport: { type: Number, default: 0 },
      accommodation: { type: Number, default: 0 },
      food: { type: Number, default: 0 },
      activities: { type: Number, default: 0 },
      total: { type: Number, default: 0 },
    },

    packingList: [packingItemSchema],

    status: {
      type: String,
      enum: ['draft', 'generated', 'failed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Trip', tripSchema);