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
  if (!this.isModified("password")) {
    next();
  }
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

// Generate and hash password reset token
UserSchema.methods.getResetPasswordToken =  async function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString('hex');

  // Hash token and set to resetPasswordToken field
  console.log("resetToken", resetToken);
  const salt = await bcrypt.genSalt(10);
  const hashedResetToken = await bcrypt.hash(resetToken, salt);

  // Set the reset token and its expiration time in the update object
  const update = {
    $set: {
      resetPasswordToken: {
        token: hashedResetToken,
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
  // console.log("hashedResetToken", hashedResetToken)

  // Return plain token
  return resetToken;
};

// Match resetPasswordToken from the user input with the hashed one in database
UserSchema.methods.matchResetPasswordToken = async function (enteredToken) {
  return await bcrypt.compare(enteredToken, this.resetPasswordToken.token);
};

module.exports = mongoose.model("User", UserSchema);
