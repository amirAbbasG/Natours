const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const ApiFeatures = require('../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError('document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        model: null
      }
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const model = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!model) {
      return next(new AppError('document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        model
      }
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const model = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        model
      }
    });
  });

exports.getOne = (Model, populateOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);

    if (populateOptions) {
      query = query.populate(populateOptions);
    }
    const model = await query;
    if (!model) {
      return next(new AppError('document not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        model
      }
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    // for review on tour nested route
    let filter = {};
    if (req.params.tourId) {
      filter = { tour: req.params.tourId };
    }

    const dataCount = await Model.count();
    const features = new ApiFeatures(Model.find(filter), req.query, dataCount)
      .filter()
      .sort()
      .select()
      .pagination();

    const model = await features.query;

    res.status(200).json({
      status: 'success',
      results: model.length,
      pageCount: features.pageCount,
      data: {
        model
      }
    });
  });
