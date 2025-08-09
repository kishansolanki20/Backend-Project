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

import connectDB from "./DB/index.js"
import app from "./app.js"

connectDB()
.then(() => {
    app.on("error", (error) => {
        console.log("ERROR", error)
        throw error
    })
    app.listen(process.env.PORT || 8000, () => {
        console.log(`Server is listening on port ${process.env.PORT}`);
    });
})
.catch((error) => {
    console.log("Failed to connect to the database:", error)
    process.exit(1); // Exit process with failure
})

