const Workspace = require("../models/WorkSpace");

// @desc    Get all workspaces
// @route   GET /api/v1/workspaces
// @access  Public
exports.getWorkspaces = async (req, res, next) => {
    let query;
    // Copy req.query
    const reqQuery = { ...req.query };
  
    // Fields to exclude
    const removeFields = ["select", "sort", "page", "limit"];
  
    // Loop over remove fields and delete them from reqQuery
    removeFields.forEach((param) => delete reqQuery[param]);
  
    // Create query string
    let queryStr = JSON.stringify(reqQuery);
  
    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
  
    // finding resource
    query = Workspace.find(JSON.parse(queryStr));
  
    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }
  
    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }
  
    // Pagination
    const page = parseInt(req.query.page, 10) || 1; 
    const limit = parseInt(req.query.limit, 10) || 25; 
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
  
    try {
      const total = await Workspace.countDocuments(); 
      query = query.skip(startIndex).limit(limit);
      // Execute query
      const workspaces = await query;
  
      // Pagination result
      const pagination = {};
  
      if (endIndex < total) {
        pagination.next = {
          page: page + 1,
          limit,
        };
      }
  
      if (startIndex > 0) {
        pagination.prev = {
          page: page - 1,
          limit,
        };
      }
      res.status(200).json({
        success: true,
        count: workspaces.length,
        pagination,
        data: workspaces,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: "Cannot find workspaces" });
    }
  };
  

// @desc    Get single workspace
// @route   GET /api/v1/workspaces/:id
// @access  Public
exports.getWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: `No workspace with the id of ${req.params.id}`,
      });
    }
    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot find workspace" });
  }
};

// @desc    create workspace
// @route   POST /api/v1/workspaces
// @access  Private
exports.createWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.create(req.body);
    res.status(201).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot create workspace" });
  }
};

// @desc    Update workspace
// @route   PUT /api/v1/workspaces/:id
// @access  Private
exports.updateWorkspace = async (req, res, next) => {
  try {
    let workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: `No workspace with the id of ${req.params.id}`,
      });
    }
    workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(200).json({
      success: true,
      data: workspace,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot update workspace" });
  }
};

// @desc    Delete workspace
// @route   DELETE /api/v1/workspaces/:id
// @access  Private
exports.deleteWorkspace = async (req, res, next) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({
        success: false,
        message: `No workspace with the id of ${req.params.id}`,
      });
    }
    await workspace.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Cannot delete workspace" });
  }
};
