const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  workspace_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true
  },
  date: {
    type: Date,
    required: [true, "Please specify the reservation date"],
  },
  startTime: {
    type: String,
    required: [true, "Please specify the start time"],
  },
  endTime: {
    type: String,
    required: [true, "Please specify the end time"],
  },
  status: {
    type: String,
    enum: ['reserved', 'cancelled','checked-in','checked-out'],
    default: 'reserved',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Reservation", ReservationSchema);
