import express from 'express';
import { loginUser, registerUser,logoutUser ,updatePassword} from '../controllers/auth.controller.js';
import isAuth from '../middlewares/isAuth.js';
const authRouter = express.Router();

authRouter.post('/register', registerUser);
authRouter.post('/login', loginUser);
authRouter.post('/logout', isAuth, logoutUser);
authRouter.post('/update-password', isAuth, updatePassword);
export default authRouter;
