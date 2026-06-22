const express = require('express');
const { protect } = require('../middlewares/authMiddleware');
const {
  createTrip,
  getTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  regenerateDay,
} = require('../controllers/tripController');

const router = express.Router();

// Every route below requires a valid JWT
router.use(protect);

router.route('/').post(createTrip).get(getTrips);
router.route('/:id').get(getTripById).put(updateTrip).delete(deleteTrip);
router.post('/:id/regenerate-day', regenerateDay);

module.exports = router;