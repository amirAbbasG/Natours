const crypto = require('crypto');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const Email = require('../utils/email');
const User = require('../models/userModel');

const responseWithTokenAndUser = (user, res, status = 200) => {
  const token = user.genAuthToken();

  res.cookie('jwt', token, {
    expires: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true
  });

  user.password = undefined;
  res.status(status).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
  });

  const url = `${req.protocol}://${req.get('host')}/getCurrentUser`;

  await new Email(user, url).sendWelcome();

  responseWithTokenAndUser(user, res, 201);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('please enter email and password', 400));
  }
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.checkPassword(password))) {
    return next(new AppError('user not found', 404));
  }

  responseWithTokenAndUser(user, res);
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return next(new AppError('user not found with this email', 404));
  }

  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users vfb/resetPassword/${resetToken}`;

  try {
    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending the email. Try again later!'),
      500
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Token is invalid or expired', 403));
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetExpires = undefined;
  user.passwordResetToken = undefined;
  await user.save();

  responseWithTokenAndUser(user, res);
});

exports.changePassword = catchAsync(async (req, res, next) => {
  const { password, passwordConfirm, currentPassword } = req.body;

  const user = await User.findById(req.user.id).select('+password');
  const isCorrectPass = await user.checkPassword(currentPassword);

  if (!isCorrectPass) {
    return next(new AppError('your password is wrong', 403));
  }

  user.password = password;
  user.passwordConfirm = passwordConfirm;
  await user.save();

  responseWithTokenAndUser(user, res);
});
