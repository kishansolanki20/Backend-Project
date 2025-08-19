import { Router } from "express";
import { loginUser, registerUser, logoutUser } from "../controllers/user.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";


const router= Router();

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxcount: 1
        },
        {
            name: "coverimage",
            maxcount: 1
        }
    ]),
    registerUser
)

router.route('/login').post(loginUser)
router.route('/logout').post(verifyJwt, logoutUser)

export default router;