import { getAllCounters } from "../services/redis/counterService.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getStats = asyncHandler(async (req, res) => {
    const stats = await getAllCounters();
    return res.status(200).json(
        new ApiResponse(200, stats, "Platform stats fetched successfully")
    );
});
