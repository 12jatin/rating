import express from 'express';
import dotenv from 'dotenv';
import cors from "cors"
import authRouter from './routes/auth.route.js';
import storeRoutes from './routes/storeRoutes.js';
import ratingRoutes from './routes/ratingRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

app.use('/api/admin', adminRoutes);

app.use("/api/auth", authRouter )
app.use('/api/stores', storeRoutes);
app.use('/api/ratings', ratingRoutes);
import pool from './config/db.js';
app.listen(process.env.PORT, () =>
  console.log(`Server started`)
);