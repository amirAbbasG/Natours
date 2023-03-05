const express = require('express');

const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const { checkAuth, checkRole } = require('../middlewares/authMiddlewares');
const {
  uploadUserPhoto,
  resizeUserPhoto
} = require('../middlewares/imageMiddlewares');

const router = express.Router();

//auth routes
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);
router.patch('/changePassword', checkAuth, authController.changePassword);

// user routes
router.use(checkAuth);

router.patch(
  '/editUser',
  uploadUserPhoto,
  resizeUserPhoto,
  userController.editUser
);
router.delete('/deleteAccount', userController.deleteAccount);

router.get(
  '/getCurrentUser',
  userController.getCurrentUser,
  userController.getUser
);

router.use(checkRole('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);
router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
