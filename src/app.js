import express from "express"
import cors from "cors"
// import router from "./routes/healthcheck.routes.js"

import cookieParser from "cookie-parser"


const app = express()
app.use(cors({
    Credential:true,
    origin:process.env.CORS_ORIGIN
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true}))
app.use(express.static("public"))
app.use(cookieParser())
app.use(errorHandler)


//import router from controllers
import router from "./routes/healthcheck.routes.js"
import userRouter from "./routes/user.routes.js"
import { errorHandler } from "./middlewares/error.middlewares.js"
//routes


app.use("/api/v1/healthCheck",router)
app.use("/api/v1/users",userRouter)

export {app}