import ApiError from "../utils/ApiError";
import asynchandler from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import User from "../models/user.models.js";

export const verifyJwt = asynchandler (async (req, _, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if(!token) {
            throw new ApiError(401, "Unauthorized access")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id).select("-password -refreshtoken")
    
        if(!user) {
            throw new ApiError(401, "Invalid access")
        }
    
        req.user=user
        next()
    } catch (error) {
        throw new ApiError(401,error?.message || "Invalid access token")
    }

})