import type { NextFunction, Request, Response } from "express";
import type { ROLES } from "../types";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../utility/sendResponse";
import jwt, { type JwtPayload } from "jsonwebtoken"
import config from "../config";
import { pool } from "../db";

const auth = (...roles: ROLES[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {

        try {
            const token = req.headers.authorization;
            if (!token) {
                return sendResponse(res, {
                    statusCode: StatusCodes.UNAUTHORIZED,
                    success: false,
                    message: "Unauthorized access: Token is missing"
                });
            }

            const decoded = jwt.verify(token, config.secret) as JwtPayload;

            const userData = await pool.query(`
        SELECT * FROM users  WHERE email=$1`, [decoded.email]);


            if (userData.rows.length === 0) {
                return sendResponse(res, {
                    statusCode: StatusCodes.UNAUTHORIZED,
                    success: false,
                    message: "User not found"
                })
            }

            const user = userData.rows[0];

            if (roles.length && !roles.includes(user.role)) {
                return sendResponse(res, {
                    statusCode: StatusCodes.FORBIDDEN,
                    success: false,
                    message: "Forbidden: You do not have permission to perform this action"

                })
            }

            req.user = decoded 

            next() ;



        } catch (error : any) {
                next(error)
        }

    }
}