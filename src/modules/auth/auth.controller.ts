import type { NextFunction, Request, Response } from "express"
import { authService } from "./auth.service"
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";

const signUp = async (req: Request, res: Response) => {
    try {
        const result = await authService.createUserIntoDB(req.body);

        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: "User registered successfully",
            data: result.rows[0],
        })

    } catch (error: any) {
        sendResponse(res, {
            statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message,
            error: error
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
  } catch (error : any) {
       sendResponse(res, {
            statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: error.message,
            error: error
        })
  }
}

export const authController = {
    signUp,
    login
}