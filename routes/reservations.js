// routes/reservations.js

const express = require("express");
const {
  getReservations,
  getReservation,
  createReservation,
  updateReservation,
  deleteReservation,
  getReservationsByUserId, // Added route to get reservations by user ID
} = require("../controllers/reservationController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

router
  .route("/")
  .get(protect, authorize("admin"), getReservations)
  .post(protect, authorize("admin", "user"), createReservation);

router
  .route("/:id")
  .get(protect, authorize("admin"), getReservation)
  .put(protect, authorize("admin", "user"), updateReservation)
  .delete(protect, authorize("admin", "user"), deleteReservation);

// Route to get reservations by user ID
router.get("/user/:userId", protect, authorize("admin"), getReservationsByUserId);

module.exports = router;
