import asynchandler from "../utils/asynchandler.js";
import { User } from "../models/user.models.js";
import ApiError from "../utils/ApiError.js";
import uploadOnCloudinary from "../utils/cloudinary.js";
import ApiResponse from "../utils/ApiResponse.js";

const registerUser = asynchandler(async (req, res) => {
    // get user details from request body
    const {fullname, email, username, password} = req.body

    // validation
    if(fullname==="" || email==="" || username==="" || password==="") {
        throw new ApiError(400,"All fields are   required")
    }

    // Here you would typically check user exist or not
    const existedUser = await User.findOne({ 
        $or: [ 
            {email: email}, 
            {username: username} 
        ]
    })
    if(existedUser) {
        throw new ApiError(409, "User already exists with this email or username")
    }

    // check for avatar and cover image
    const avatarLocalPath = req.files?.avatar[0]?.path
    //const coverImageLocalPath = req.files?.coverimage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length > 0) {
        coverImageLocalPath = req.files.coverimage[0].path;
    }

    if(!avatarLocalPath) {
        throw new ApiError(400, "Avatar is required")
    }

    // upload avatar and cover image to cloudinary
    const avatarResponse = await uploadOnCloudinary(avatarLocalPath)
    const coverImageResponse = await uploadOnCloudinary(coverImageLocalPath)

    // check avatar upload response
    if(avatarResponse==null) {
        throw new ApiError(400, "Avatar upload failed")
    }

    //create user - create entry in database
    const user = await User.create({
        fullname,
        email,
        username: username.toLowerCase(),
        password,
        avatar: avatarResponse.url, // save the url of uploaded avatar
        coverImage: coverImageResponse ? coverImageResponse.url : null // save the url of uploaded cover image if exists
    })

    //check for user creation
    const userId = await User.findById(user._id).select("-password -refreshtoken")

    if(!userId) {
        throw new ApiError(500, "User creation failed")
    }

    // send response
    return res.status(201).json(
        new ApiResponse(201, userId, "User registered successfully")
    );

})

export { registerUser };