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
    validate: {
      validator: function(value) {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0); // Reset hours to midnight for comparison
        const providedDate = new Date(value);
        providedDate.setHours(0, 0, 0, 0); // Reset hours to midnight for comparison
        return providedDate > currentDate;
      },
      message: "Reservation date must be tomorrow or further in the future"
    }
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
