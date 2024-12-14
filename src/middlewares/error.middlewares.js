import mongoose from "mongoose"

import { ApiError } from "../utils/apiError.js"


const errorHandler = (err, req, res, next) => {
    let error = err



}

export {errorHandler}

//some of the middlewares goes into the routes and some of the 
//them goes into app.js always or sometime you need to remember that