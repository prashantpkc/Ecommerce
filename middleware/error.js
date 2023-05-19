const ErrorHandler = require("../utils/errorhandler");

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Wrong Mongodb Id error
  if (err.name === "CastError") {
    const message = `Resource not found. Invalid: ${err.path}`;
    err = new ErrorHandler(message, 400);
  }

  //Mongooose dublicate key error
  if (err.code === 11000) {
    const message = `Dublicate ${Object.keys(err.keyValue)} Entered`;
    err = new ErrorHandler(message, 400);
  }

  //Wrong JWT error
  if (err.name === "JsonWebTokenError") {
    const message = `JsonWebToken is Invalid, try again`;
    err = new ErrorHandler(message, 400);
  }

  //JWT EXPIRE error
  if (err.name === "TokenEcpiredError") {
    const message = `JsonWebToken is Expired, try again`;
    err = new ErrorHandler(message, 400);
  }

  res.status(err.statusCode).json({
    success: false,
    // error: err.stack,
    message: err.message,
  });
};
