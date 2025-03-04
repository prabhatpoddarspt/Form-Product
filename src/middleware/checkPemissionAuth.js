import { ApiError } from "../util/ApiErrors.js";
import jwt from "jsonwebtoken";

export const verifyPermissionToken = () => {
    return async (req, res, next) => {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json(new ApiError(401, "Unauthorized request"));
        }

        try {
            const decodedToken = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
            if (!decodedToken.email) {
                return res.status(401).json(new ApiError(401, "Access Token has expired"));
        
            }


            req.user = decodedToken;
            next();
        } catch (error) {
            if (error instanceof jwt.TokenExpiredError) {
                return res.status(401).json(new ApiError(401, "Access Token has expired"));
            }

            return res.status(401).json(new ApiError(401, "Invalid Access Token"));
        }
    };
};
