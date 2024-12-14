import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/apiError.js"
import {User} from "../models/user.models.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/apihandler.js"


const registerUser = asyncHandler (async(req,res)=>{
    const {fullname,email,username, password} = req.body

    //validation will be discussed deeply in nextjs bus as for now
    if ([fullname,username,email,password].some((field) => field?.trim() === "")){
        throw new ApiError(400, "All fields are required")
    } 

    const existedUser = await User.findOne({
        $or: [{username},{email}]
    })
    if (existedUser) {
        throw new ApiError(400, "User with email or username already exists")
    }
    const avatarLocalPath = req.files?.avatar[0]?.path
    const coverLocalPath = req.files?.coverImage[0]?.path
    if (!avatarLocalPath) {
            throw new ApiError(400, "Avatar file is missing")
        }
    const avatar = await uploadOnCloudinary(avatarLocalPath)

    let coverImage = ""
    if (coverLocalPath) {
        coverImage = await uploadOnCloudinary(coverImage)
    }

    const user = await User.create({
        fullname,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering a user")        
    }


    return res
        .status(201)
        .json( new ApiResponse(200, createdUser, "User registered successfully"))
})

export {registerUser}