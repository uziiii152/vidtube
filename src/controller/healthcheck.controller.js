import {ApiResponse} from "../utils/apihandler.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const healthCheck = asyncHandler ( async (req,res) => {
    return res
    .status(200)
    .json(new ApiResponse(200,"ok","health check passed"))
})
console.log("Exporting healthCheck...");
export {healthCheck}