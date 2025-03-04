import dotenv from "dotenv"
import connectDB from "./config/db.js";
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import expressfileupload from "express-fileupload"
import httpLogger from "./util/createLogger.js"

import userRoutes from "./routes/user.routes.js"
import adminRoutes from "./routes/admin.routes.js"
import utilRoutes from "./routes/util.routes.js"

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express()
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.get("/", (req, res) => res.send("Working!!!"));
app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(cookieParser())
app.use(expressfileupload());
app.use(httpLogger);
dotenv.config({
    path: './.env'
})

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/util', utilRoutes);




connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})