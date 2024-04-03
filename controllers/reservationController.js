// controllers/reservationController.js
const Reservation = require('../models/Reservation');

async function createReservation(req, res) {
  try {
    const { userId, workspaceId, date } = req.body;

    // Create new reservation
    const reservation = new Reservation({
      userId,
      workspaceId,
      date
    });

    await reservation.save();

    res.status(201).json({ message: 'Reservation created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Implement other reservation controller functions as needed

module.exports = {
  createReservation
};
