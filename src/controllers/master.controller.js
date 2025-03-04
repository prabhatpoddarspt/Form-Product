import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Master from "../models/master.model.js"; // Import the Master model

// Create multiple master entries using insertMany
const createMasters = asyncHandler(async (req, res) => {
    const masterData = req.body;
    const masters = await Master.insertMany(masterData);
    return res.status(201).json(new ApiResponse(201, masters, "Master data created successfully"));
});

// Get all master entries
const getMasters = asyncHandler(async (req, res) => {
    const { key, region, category } = req.query
    const filter = {}
    if (key) {
        filter.key = key
    }
    if (region) {
        filter.region = region
    }
    if (category) {
        filter.category = category
    }
    const masters = await Master.find(filter).select("value other");
    return res.status(200).json(new ApiResponse(200, masters, "Master data fetched successfully"));
});

export {
    createMasters,
    getMasters,
};
