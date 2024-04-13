const express = require("express");
const {
  getWorkspaces,
  getWorkspace,
  createWorkspace,
  updateWorkspace,
  deleteWorkspace,
} = require("../controllers/workspaceController");

const router = express.Router();

const { protect, authorize } = require("../middleware/auth");

/**
 * @swagger
 * /workspaces:
 *   get:
 *     summary: Get all workspaces
 *     description: Retrieves a list of all workspaces available for booking.
 *     responses:
 *       200:
 *         description: A list of workspaces
 *       404:
 *         description: No workspaces found
 *   post:
 *     summary: Create a workspace
 *     description: Creates a new workspace for booking. Requires admin access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Workspace created successfully
 *       400:
 *         description: Invalid input data
 */

/**
 * @swagger
 * /workspaces/{id}:
 *   get:
 *     summary: Get a single workspace
 *     description: Retrieves details of a specific workspace.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Workspace details
 *       404:
 *         description: Workspace not found
 *   put:
 *     summary: Update a workspace
 *     description: Updates an existing workspace. Requires admin access.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *               capacity:
 *                 type: integer
 *               amenities:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: Workspace updated successfully
 *       400:
 *         description: Invalid input data
 *   delete:
 *     summary: Delete a workspace
 *     description: Deletes a specific workspace. Requires admin access.
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
 *         description: Workspace deleted
 *       404:
 *         description: Workspace not found
 */

router
  .route("/")
  .get(getWorkspaces)
  .post(protect, authorize("admin"), createWorkspace);

router
  .route("/:id")
  .get(getWorkspace)
  .put(protect, authorize("admin"), updateWorkspace)
  .delete(protect, authorize("admin"), deleteWorkspace);

module.exports = router;
