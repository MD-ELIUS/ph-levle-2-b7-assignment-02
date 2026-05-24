import type { NextFunction, Request, Response } from "express"
import { authService } from "./auth.service"
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";
import type { CustomError } from "../../types";

const signUp = async (req: Request, res: Response) => {
    try {
        const result = await authService.createUserIntoDB(req.body);

        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        })

    } catch (error) {
         const err = error as CustomError;
        sendResponse(res, {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: err.message,
            error: err
        })
    }
}


const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await authService.loginUserFromDB(req.body);

       sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Login successful",
            data: result,
        })
  } catch (error) {
     const err = error as CustomError;
       sendResponse(res, {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: err.message,
            error: err
        })
  }
}

export const authController = {
    signUp,
    login
}