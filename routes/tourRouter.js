const express = require('express');

const tourController = require('../controllers/tourController');
const reviewRouter = require('./reviewRouter');
const { aliasTopTours } = require('../middlewares/tourMiddlewares');
const { checkAuth, checkRole } = require('../middlewares/authMiddlewares');
const {
  uploadTourImages,
  resizeTourImages
} = require('../middlewares/imageMiddlewares');

const router = express.Router();

// router.param('id', checkId);

router.use('/:tourId/reviews', reviewRouter);

// tours routes
// alias
router.route('/top-5-cheap').get(aliasTopTours, tourController.getAllTours);
router.get(
  '/tours-within/:distance/center/:latlng/unit/:unit',
  tourController.getToursWithin
);

router.get('/distances/:latlng/unit/:unit', tourController.getDistances);

router.route('/tours-stat').get(tourController.getToursStat);
router
  .route('/monthly-plan/:year')
  .get(
    checkAuth,
    checkRole('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/')
  .get(tourController.getAllTours)
  .post(checkAuth, checkRole('admin', 'lead-guide'), tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    checkAuth,
    checkRole('admin', 'lead-guide'),
    uploadTourImages,
    resizeTourImages,
    tourController.updateTour
  )
  .delete(
    checkAuth,
    checkRole('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
