import dotenv from "dotenv";
dotenv.config();
import {v2 as cloudinary} from "cloudinary";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadFile(filePath: string) {
    const result = await cloudinary.uploader.upload(filePath, {
        upload_preset: "users_avatar",
    });
    return result;
}

// async function testUpload() {
//     const result = await uploadFile("path/to/local/avatar.png");
//     console.log("Secure URL:", result.secure_url);
// }

// testUpload();