import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apihandler.js";
import jwt from "jsonwebtoken"

const generateAccessAndRefereshTokens = async(userId) =>{
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return {accessToken, refreshToken}


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    const { fullname, email, username, password } = req.body;

    // Validation
    if ([fullname, username, email, password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    // Check if user already exists
    console.log("Checking if user exists with email:", email, "or username:", username);
    const existedUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existedUser) {
        console.log("User already exists:", existedUser);
        throw new ApiError(400, "User with email or username already exists");
    }

    console.warn(req.files);

    const avatarLocalPath = req.files?.avatar?.[0]?.path;
    const coverLocalPath = req.files?.coverImage?.[0]?.path;
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing");
    }

    let avatar, coverImage;
    try {
        avatar = await uploadOnCloudinary(avatarLocalPath);
        console.log("Uploaded avatar:", avatar);
    } catch (error) {
        console.log("Error uploading avatar:", error);
        throw new ApiError(500, "failed to upload the avatar");
    }
    try {
        coverImage = await uploadOnCloudinary(coverLocalPath);
        console.log("Uploaded coverImage:", coverImage);
    } catch (error) {
        console.log("Error uploading coverImage:", error);
        throw new ApiError(500, "failed to upload the coverImage");
    }

    // Create user
    try {
        const userData = {
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url || "",
            email,
            password,
            username: username.toLowerCase(),
        };
        console.log("Data being passed to User.create:", userData);

        const user = await User.create(userData);
        console.log("User created:", user);

        const createdUser = await User.findById(user._id).select("-password -refreshToken");
        if (!createdUser) {
            throw new ApiError(500, "Something went wrong while registering a user");
        }

        return res.status(201).json(new ApiResponse(200, createdUser, "User registered successfully"));
    } catch (error) {
        console.error("User creation failed:", error);
        if (avatar) {
            await deleteFromCloudinary(avatar.public_id);
        }
        if (coverImage) {
            await deleteFromCloudinary(coverImage.public_id);
        }
        throw new ApiError(500, "Something went wrong while registering a user and images are deleted");
    }
});

const loginUser = asyncHandler(async (req, res) => {
    // get a data from body
    const {email,username, password} = req.body

    //validation
    if (!email) {
        throw new ApiError(400,"Email is required")
    }
    const user = await User.findOne({
        $or: [{username},{email}]
    })
    if (!user) {
        throw new ApiError(404, "User not found")
    }
    // validate password

   const isPasswordCorrect = await user.isPasswordCorrect(password)

   if (!isPasswordCorrect) {
    throw new ApiError(401, "Invalid credentials")
   }

   const {accessToken, refreshToken} = await generateAccessAndRefereshTokens(user._id)
   const loggedInUser = await User.findById(user._Id).select("-password -refreshToken")
    
   if (!loggedInUser) {
    throw new ApiError(400, "user is not logged in")
   }
const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV == "production",
}
return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken",refreshToken, options)
    .json(new ApiResponse(
        200,
        {user: loggedInUser, accessToken,refreshToken},
        "user logged in successfully"
    ))
})
const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        // req.user._id need to come back after middlerware video this todo for us
        req.user._id,
        {
            $set: {
                refreshToken: undefined,
            }
        },
        {new: true}
    )

    const options = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",

    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json( new ApiResponse(200, {}, "User logged out successfully"))

}) 
const refreshAccessToken = asyncHandler( async (req,res) => {
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
  if (!incomingRefreshToken) {
    throw new ApiError(401, "refresh token is required")
  }  
  try {
    const decodedToken = jwt.verify(
        incomingRefreshToken,
        process.env.REFRESH_TTOKEN_SECRET
    )
    const user = await User.findById(decodedToken?._id)
   if (!user) {
    throw new ApiError(401, "Invalid refresh token")
   } 
if (incomingRefreshToken !== user?.refreshToken) {
    throw new ApiError(401, "Invalid refresh token")
}

const options = {
   httpOnly : true,
   secure: process.env.NODE_ENV === "production" 
}
const {accessToken,refreshToken: newRefreshToken}= await generateAccessAndRefereshTokens(user._id)
return res
.status(200)
.cookie("accessToken", accessToken,options)
.cookie("refreshToken",newRefreshToken,options)  
.json(new ApiResponse(
    200,
    {
        accessToken,
        refreshToken: newRefreshToken
    },
    "Access token refreshed successfully"
))

} catch (error) {
    throw new ApiError(500, "Something went wrong while refreshing access token")
  }
})

export { 
    registerUser,
    loginUser,
    refreshAccessToken,
    logoutUser
};
