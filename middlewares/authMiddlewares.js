const { promisify } = require('util');
const jwt = require('jsonwebtoken');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');

exports.checkAuth = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // check token exist
  if (!token) {
    return next(
      new AppError('You are not logged in! pleas log in to get access', 401)
    );
  }

  // verify token
  const decodeToken = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET
  );

  // check is user exist
  const user = await User.findById(decodeToken.id);
  if (!user) {
    return next(
      new AppError(
        'The user belonging to this token does no longer exist.',
        401
      )
    );
  }

  // check if user password changed after jwt created time
  if (user.changedPasswordAfter(decodeToken.iat)) {
    return next(
      new AppError('User recently changed password! Please log in again.', 401)
    );
  }

  req.user = user;
  next();
});

exports.checkRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};
