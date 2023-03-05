const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const User = require('../models/userModel');
const handlerFactory = require('./handlerFactory');

const filterObj = (obj, ...allowedFilds) => {
  const newObj = {};
  Object.keys(obj).forEach(k => {
    if (allowedFilds.includes(k)) {
      newObj[k] = obj[k];
    }
  });

  return newObj;
};

exports.editUser = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'This route is not for password updates. Please use /updateMyPassword.',
        400
      )
    );
  }
  const filteredBody = filterObj(req.body, 'name', 'email');
  if (req.file) filteredBody.photo = req.file.filename;

  const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user
    }
  });
});

exports.deleteAccount = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(200).json({
    status: 'success',
    data: null
  });
});

exports.getCurrentUser = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.getAllUsers = handlerFactory.getAll(User);

exports.updateUser = handlerFactory.updateOne(User);

exports.deleteUser = handlerFactory.deleteOne(User);

exports.getUser = handlerFactory.getOne(User);

exports.createUser = handlerFactory.createOne(User);
