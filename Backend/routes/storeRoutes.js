import express from 'express';
import { getAllStores, getStoreById } from '../controllers/storeController.js';
import isAuth from '../middlewares/isAuth.js';

const storeRoutes = express.Router();

// Protected routes
storeRoutes.get('/', isAuth, getAllStores);
storeRoutes.get('/:id',isAuth, getStoreById);

export default storeRoutes;
