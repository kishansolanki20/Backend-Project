import { v2 as cloudinary} from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

const uploadOnCloudinary = async (localfilepath) => {
    try {
        if(!localfilepath) return null
        // upload the file on cloudinary
        const response = await cloudinary.uploader.upload(localfilepath, {
            resource_type: "auto"
        })
        // file has been uploaded successfully
        //console.log("file is uploaded successfully", response.url);
        fs.unlinkSync(localfilepath) // remove the local saved file as upload got successful
        return response;
    } catch(error) {
        fs.unlinkSync(localfilepath) // remove the local or unlink saved file as upload got failed
        return null
    }
}

export default  uploadOnCloudinary