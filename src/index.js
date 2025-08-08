//require("dotenv").config({path: "./.env" });
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });  

/*import express from "express"
const app = express()

( async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", (error) => {
            console.error("ERROR", error);
            throw error;
        })
        app.listen(process.env.PORT, () => {
            console.log(`Server is listening on port ${process.env.PORT}`);
        });
    } catch (error) {
        console.error("ERROR:", error)
        throw error
    }
})();*/

import connectDB from "./DB/index.js";
connectDB();

