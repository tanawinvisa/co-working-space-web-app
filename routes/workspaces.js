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

router
  .route("/")
  .get(getWorkspaces)
  .post(protect, authorize("admin","user"), createWorkspace);

router
  .route("/:id")
  .get(getWorkspace)
  .put(protect, authorize("admin","user"), updateWorkspace)
  .delete(protect, authorize("admin","user"), deleteWorkspace);

module.exports = router;
