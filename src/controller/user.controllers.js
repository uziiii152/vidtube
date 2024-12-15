import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/apihandler.js";

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

export { registerUser };
