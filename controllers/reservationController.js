const Reservation = require("../models/Reservation");
const Workspace = require("../models/WorkSpace");

// @desc    Get all reservations
// @route   GET /api/v1/reservations
// @access  Private
exports.getReservations = async (req, res, next) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }
    const reservations = await Reservation.find();
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch reservations",
    });
  }
};

// @desc    Get reservations by user ID
// @route   GET /api/v1/reservations/user/:userId
// @access  Private
exports.getReservationsByUserId = async (req, res, next) => {
  try {
    // Check if the requesting user is an admin
    if (!(req.user.role === "admin" || req.user.id === req.params.userId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this resource",
      });
    }

    const reservations = await Reservation.find({ user_id: req.params.userId });
    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch reservations",
    });
  }
};

// @desc    Get a single reservation
// @route   GET /api/v1/reservations/:id
// @access  Private
exports.getReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }
    // Ensure the user making the request owns the reservation
    console.log(reservation.user_id.toString(), req.user.role);
    if (
      !(
        reservation.user_id.toString() === req.user.id ||
        req.user.role.toString() === "admin"
      )
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to access this reservation",
      });
    }
    res.status(200).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch reservation",
    });
  }
};

// @desc    Create a reservation
// @route   POST /api/v1/reservations
// @access  Private
exports.createReservation = async (req, res, next) => {
  try {
    // Add user Id to req.body
    console.log(req.body);
    req.body.user = req.user.id;

    // Check if the user has already reserved 3 rooms with status "reserved"
    const userReservations = await Reservation.find({
      user_id: req.user.id,
      status: "reserved",
    });
    if (userReservations.length >= 3) {
      return res.status(400).json({
        success: false,
        message: "You can only reserve up to 3 rooms with status 'reserved'",
      });
    }

    const { date, workspace_id} = req.body;

    // Check if the workspace exists
    const workspace = await Workspace.findById(workspace_id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: "Workspace not found",
      });
    }
    // Check if the reservation date and time is in the future
    const currentDateTime = new Date();
    console.log((new Date(date) > currentDateTime));
    if ( !(new Date(date) > currentDateTime)) {
      return res.status(400).json({
        success: false,
        message: "Reservation date and time must be the day in the future",
      });
    }

    // Check if the workspace is already reserved on the given date and time
    const existingReservation = await Reservation.findOne({
      workspace_id: workspace_id,
      date: date,
    });
    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: "The workspace is already reserved on the given date and time",
      });
    }

    // Create the reservation
    const reservation = await Reservation.create({
      user_id: req.user.id,
      workspace_id: workspace_id,
      date: new Date(date),
      status: "reserved", // Set status to "reserved"
    });

    res.status(201).json({
      success: true,
      data: reservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to create reservation",
    });
  }
};

// @desc    Update a reservation
// @route   PUT /api/v1/reservations/:id
// @access  Private
exports.updateReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Check if the requesting user is an admin
    console.log(req.user.id ,reservation.user_id.toString())
    if (!(reservation.user_id.toString() === req.user.id || req.user.role === "admin")) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this resource",
      });
    }

    // Check if the updated reservation date is tomorrow or further in the future
    if (req.body.date && !(new Date(req.body.date) >= new Date(new Date().setDate(new Date().getDate() + 1)))) {
      return res.status(400).json({
        success: false,
        message: "Updated reservation date must be tomorrow or further in the future",
      });
    }
    

    // Check if the reservation is "reserved"
    if (reservation.status !== "reserved") {
      return res.status(400).json({
        success: false,
        message: "You can only update reservations with status 'reserved'",
      });
    }

    const updatedReservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: updatedReservation,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to update reservation",
    });
  }
};

// @desc    Delete a reservation
// @route   DELETE /api/v1/reservations/:id
// @access  Private
exports.deleteReservation = async (req, res, next) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    // Check if the requesting user is an admin
    if (!(reservation.user_id.toString() === req.user.id || req.user.role === "admin")) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this resource",
      });
    }

    // Check if the reservation is "reserved"
    if (reservation.status !== "reserved") {
      return res.status(400).json({
        success: false,
        message: "You can only delete reservations with status 'reserved'",
      });
    }

    await reservation.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Unable to delete reservation",
    });
  }
};
