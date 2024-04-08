const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
  },
  email: {
    type: String,
    required: [true, "Please add an email"],
    unique: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please add a valid email",
    ],
  },
  telephoneNumber: {
    type: String,
    required: [true, "Please add a telephone number"],
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "Please add a password"],
    minlength: 6,
    select: false,
  },
  otp: {
    value: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  resetPasswordToken: {
    token: {
      type: String,
    },
    expiresAt: {
      type: Date,
    },
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  googleAuth: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Encrypt password using bcrypt
UserSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate password reset token
UserSchema.methods.generateResetToken = async function () {
  // Generate a random string
  const resetToken = crypto.randomBytes(20).toString('hex');
  console.log("resetToken", resetToken);

  // Set the reset token and its expiration time in the update object
  const update = {
    $set: {
      resetPasswordToken: {
        token: resetToken,
        expiresAt: Date.now() + 5 * 60 * 1000, // Token expires in 5 minutes
      }
    }
  };

  // Update the user document with the reset token
  await this.model('User').findOneAndUpdate(
    { _id: this._id },
    update,
    { new: true } // To return the updated document
  );

  // Return the generated reset token
  return resetToken;
};


module.exports = mongoose.model("User", UserSchema);
