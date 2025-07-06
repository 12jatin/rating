import express from 'express';
import { submitOrUpdateRating, getUserRatings ,getOwnerStoreRatings} from '../controllers/ratingController.js';
import isAuth from '../middlewares/isAuth.js';

const ratingRoutes = express.Router();

// Protected routes
ratingRoutes.post('/', isAuth, submitOrUpdateRating);
ratingRoutes.get('/my', isAuth, getUserRatings);
ratingRoutes.get('/owner', isAuth, getOwnerStoreRatings);

export default ratingRoutes;
