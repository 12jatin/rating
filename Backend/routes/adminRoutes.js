import express from 'express';
import {
  getAdminStats,
  getAllUsers,
  createUser,
  getAllAdminStores,
  createStore,
} from '../controllers/adminController.js';
import isAuth from '../middlewares/isAuth.js';

const router = express.Router();


router.use(isAuth);


router.get('/stats', getAdminStats);

router.get('/users', getAllUsers);
router.post('/users', createUser);


router.get('/stores', getAllAdminStores);
router.post('/stores', createStore);

export default router;
