const express = require('express');
const reviewController = require('../controllers/reviewController');
const { checkAuth, checkRole } = require('../middlewares/authMiddlewares');

const router = express.Router({ mergeParams: true });

router.use(checkAuth);

router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    checkRole('user'),
    reviewController.setTourAndUserIds,
    reviewController.createReview
  );

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(checkRole('user', 'admin'), reviewController.updateReview)
  .delete(checkRole('user', 'admin'), reviewController.deleteReview);

module.exports = router;
