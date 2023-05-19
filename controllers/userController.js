const ErrorHandler = require("../utils/errorhandler");
const catchAsyncError = require("../middleware/catchAsyncError");

const User = require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");

const crypto = require("crypto");
const bcrypt = require("bcrypt");

//Register a user

exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
    avatar: {
      public_id: "this is a sample id",
      url: "profilepicUrl",
    },
  });

  sendToken(user, 201, res);
});

exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;
  //check if user has given password and email both

  if (!email || !password)
    return next(new ErrorHandler("Please Enter Email & Password", 400));

  const user = await User.findOne({ email: email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid email or password", 401));

  //   let isPasswordMatched = await bcrypt.compare(password, user.password);

  const isPasswordMatched = await user.comparePassword(password);
  if (!isPasswordMatched)
    return next(new ErrorHandler("Invalid email or password", 401));

  sendToken(user, 200, res);
  // const token = user.getJWTToken()

  // res.status(200).json({success:true, token})
});

//Logout User

exports.logout = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
  });

  return res.status(200).json({ success: true, message: "Logged out" });
});

//Forgot Password

exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) return next(new ErrorHandler("User not found"), 404);

  // Get ResetPassword Token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });
  const resetPasswordUrl = `${req.protocol}://${req.get(
    "host"
  )}http://localhost/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is :-  \n\n ${resetPasswordUrl} \n\n if you have not requested this email then please ignorenit`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
});

//Reset Password

exports.resetPassword = catchAsyncError(async (req, res, next) => {
  //create token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user)
    return next(
      new ErrorHandler("Reset password token is invalid or has been expired"),
      404
    );

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("password does not match"), 404);
  }

  user.password = req.body.password;

  user.resetPasswordExpire = undefined;
  user.resetPasswordToken = undefined;

  await user.save();

  sendToken(user, 200, res);
});

//get User Details

exports.getuserDetails = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

//Update User Password

exports.updatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched)
    return next(new ErrorHandler("Old password is incorrect", 400));

  if (req.body.newPassword !== req.body.confirmPassword)
    return next(new ErrorHandler("Password does not match", 400));

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

//Update User Profile

exports.updateProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };
  // cloud later

  const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Get all users (admin)

exports.getAllUsers = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({ success: true, users });
});

//Get specific single user (admin)

exports.getSingleUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`user does not exist with Id: ${req.params.id}`)
    );
  }
  res.status(200).json({ success: true, user });
});

//Update User Role --admin

exports.updateUserRole = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };
  // cloud later

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    success: true,
    user,
  });
});

//Delete User --admin

exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User not exist with this id: ${req.params.id}`)
    );
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "user Deleted succesfully"
  
  });
});
