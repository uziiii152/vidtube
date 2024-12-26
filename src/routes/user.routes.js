
import express from 'express';
import {upload} from "../middlewares/multer.middlewares.js"
import {registerUser,logoutUser,loginUser,refreshAccessToken,changeCurrentPassword,getUserChannelProfile,updateAccountDetails,updateUserAvatar,updateUserCoverImage,getWatchHistory} from '../controller/user.controllers.js'; 
import verifyJWT from "../middlewares/auth.middlewares.js"



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
router.route('/current-user').get(verifyJWT,getCurrentUser)
router.route('/c/:username').get(verifyJWT,getUserChannelProfile)
router.route('/update-account').patch(verifyJWT,updateAccountDetails)
router.route('/avatar').patch(verifyJWT, upload.single('avatar'),updateUserAvatar)
router.route('/cover-Image').patch(verifyJWT, upload.single('coverImage'),updateUserCoverImage)
router.route('/history').get(verifyJWT,getWatchHistory)


export default userRouter; 
