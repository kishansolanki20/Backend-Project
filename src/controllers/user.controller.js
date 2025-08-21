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

const loginUser = asynchandler(async (req, res) => {
    // login logic will go here
    
    // Get login details from request body
    // Find the user in the database
    // Check if the password matches
    // Access and refresh token generation
    // Send cookies


    // login details
    const {email, username, password} = req.body

    // validation
    if(!username && !email) {
        throw new ApiError(400, "Username or email are required")
    }

    // check if user exists
    const userFound = await User.findOne({
        $or: [
            {email: email},
            {username: username}
        ]
    })

    if(!userFound) {
        throw new ApiError(404, "User not found")
    }

    // check if password is matches
    const passworkCheck = await userFound.isPasswordCorrect(password)
    
    if(!passworkCheck) {
        throw new ApiError(401, "Invalid password")
    }

    // generate access and refresh tokens
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(userFound._id)

    // we have to call database for user details again
    // beacause we don't want to send password and refresh token in response
    // and we do not have refreshtoken in above userFound
    // as we save it in fuction generateAccessAndRefreshTokens 
    const loggedInUser = await User.findById(userFound._id).select("-password -refreshtoken")

    const options = {
        httpOnly: true,
        secure: true  // now only server can modify cookies, beforethat anyone can modify cookies bydefault
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json
    (
        new ApiResponse(200,{ loggedInUser, accessToken, refreshToken }, "User logged in successfully")
    )

})

const logoutUser = asynchandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,  // now server can modify cookies, beforethat anyone can modify cookies bydefault
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"))
})

export { registerUser, loginUser, logoutUser};



const generateAccessAndRefreshTokens = async (userId) => {
    try {
        const user = await User.findById(userId)

        // Generate access token
        const accessToken = user.generateAccessToken();
        
        // Generate refresh token
        const refreshToken = user.generateRefreshToken();
        
        // Save refresh token in the user document
        user.refreshtoken = refreshToken;
        await user.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Error generating tokens");
    }
} 