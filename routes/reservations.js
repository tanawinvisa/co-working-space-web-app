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


/**
 * @swagger
 * /reservations:
 *   get:
 *     summary: Get all reservations
 *     description: Retrieves a list of all reservations. Requires admin access.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of reservations
 *       403:
 *         description: Access denied
 *   post:
 *     summary: Create a reservation
 *     description: Creates a new reservation. Requires user or admin access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workspaceId:
 *                 type: string
 *               userId:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       201:
 *         description: Reservation created successfully
 *       400:
 *         description: Invalid data provided
 */

/**
 * @swagger
 * /reservations/{id}:
 *   get:
 *     summary: Get a single reservation
 *     description: Retrieves details of a specific reservation. Requires user or admin access.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Reservation details
 *       404:
 *         description: Reservation not found
 *   put:
 *     summary: Update a reservation
 *     description: Updates an existing reservation. Requires user or admin access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               workspaceId:
 *                 type: string
 *               userId:
 *                 type: string
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Reservation updated
 *       404:
 *         description: Reservation not found
 *   delete:
 *     summary: Delete a reservation
 *     description: Deletes a specific reservation. Requires user or admin access.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Reservation deleted
 *       404:
 *         description: Reservation not found
 */

/**
 * @swagger
 * /reservations/user/{userId}:
 *   get:
 *     summary: Get reservations by user ID
 *     description: Retrieves all reservations associated with a specific user. Requires user or admin access.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of reservations
 *       404:
 *         description: No reservations found
 */

router
  .route("/")
  .get(protect, authorize("admin"), getReservations)
  .post(protect, authorize("admin", "user"), createReservation);

router
  .route("/:id")
  .get(protect, authorize("admin", "user"), getReservation)
  .put(protect, authorize("admin", "user"), updateReservation)
  .delete(protect, authorize("admin", "user"), deleteReservation);

// Route to get reservations by user ID
router.get("/user/:userId", protect, authorize("admin","user"), getReservationsByUserId);

module.exports = router;
