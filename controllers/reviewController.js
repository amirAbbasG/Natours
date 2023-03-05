const Review = require('../models/reviewModel');
const handlerFactory = require('./handlerFactory');

exports.setTourAndUserIds = (req, res, next) => {
  if (!req.body.tour) {
    req.body.tour = req.params.tourId;
  }
  req.body.user = req.user.id;
};

exports.getAllReviews = handlerFactory.getAll(Review);

exports.getReview = handlerFactory.getOne(Review);

exports.createReview = handlerFactory.createOne(Review);

exports.updateReview = handlerFactory.updateOne(Review);

exports.deleteReview = handlerFactory.deleteOne(Review);
