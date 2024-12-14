
import express from 'express';
import {upload} from "../middlewares/multer.middlewares.js"
import {registerUser} from '../controller/user.controllers.js'; 




const userRouter = express.Router(); 
userRouter.route('/register').post(upload.fields([{
    name:"avatar",
    maxCount:1
},{
    name:"coverImage",
    maxCount:1
}]),registerUser);


export default userRouter; 
