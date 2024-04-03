const mongoose = require("mongoose");

const WorkspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name cannot be more than 50 characters"],
  },
  address: {
    type: String,
    required: [true, "Please add an address"],
  },
  telephoneNumber: {
    type: String,
    required: [true, "Please add a telephone number"],
  },
  openingTime: {
    type: String,
    required: [true, "Please add the opening time"],
  },
  closingTime: {
    type: String,
    required: [true, "Please add the closing time"],
  },
  capacity: {
    type: Number,
    required: [true, "Please add the capacity"],
  },
  amenities: {
    type: [String],
    default: [],
  },
  imageUrl: {
    type: String,
  },
  description: {
    type: String,
  },
},
{
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
});

module.exports = mongoose.model("Workspace", WorkspaceSchema);
