
import express from 'express';
import {upload} from "../middlewares/multer.middlewares.js"
import {registerUser,
    logoutUser,
    loginUser,
    refreshAccessToken,
    changeCurrentPassword,
    getUserChannelProfile,
    updateAccountDetails,
    updateUserAvatar,
    updateUserCoverImage,
    getWatchHistory,
    getCurrentUser} from '../controller/user.controllers.js'; 
import {verifyJWT} from "../middlewares/auth.middlewares.js"



const userRouter = express.Router(); 

//unsecured routes
userRouter.route('/register').post(upload.fields([{
    name:"avatar",
    maxCount:1
},{
    name:"coverImage",
    maxCount:1
}]),registerUser);

userRouter.route('/login').post(loginUser)
userRouter.route('/refresh-token').post(refreshAccessToken)

//secured routes
userRouter.route('/logout').post(verifyJWT,logoutUser)
userRouter.route('/change-password').post(verifyJWT,changeCurrentPassword)
userRouter.route('/current-user').get(verifyJWT,getCurrentUser)
userRouter.route('/c/:username').get(verifyJWT,getUserChannelProfile)
userRouter.route('/update-account').patch(verifyJWT,updateAccountDetails)
userRouter.route('/avatar').patch(verifyJWT, upload.single('avatar'),updateUserAvatar)
userRouter.route('/cover-Image').patch(verifyJWT, upload.single('coverImage'),updateUserCoverImage)
userRouter.route('/history').get(verifyJWT,getWatchHistory)


export default userRouter; 
