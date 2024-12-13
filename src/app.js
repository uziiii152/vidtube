import express from "express"
import cors from "cors"
// import router from "./routes/healthcheck.routes.js"
import router from "./routes/healthcheck.routes.js"
import cookieParser from "cookie-parser "


const app = express()
app.use(cors({
    Credential:true,
    origin:process.env.CORS_ORIGIN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())


//import router from controllers

app.use("/api/v1/healthCheck",router)

export {app}