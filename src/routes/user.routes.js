
import express from 'express';
import {upload} from "../middlewares/multer.middlewares.js"
import {registerUser,logoutUser} from '../controller/user.controllers.js'; 
import verifyJWT from "../middlewares/auth.middlewares.js"



const userRouter = express.Router(); 
userRouter.route('/register').post(upload.fields([{
    name:"avatar",
    maxCount:1
},{
    name:"coverImage",
    maxCount:1
}]),registerUser);

userRouter.route('/logout').post(verifyJWT,logoutUser)
export default userRouter; 
