import type { ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import type { CustomError } from "../types";
import sendResponse from "../utility/sendResponse";


const globalErrorHandler: ErrorRequestHandler = (err, req, res, next) => {
    
    const error = err as CustomError; 

    sendResponse(res, {
        statusCode: error.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        success: false,
        message: error.message || "Something went wrong",
        error: error
    });
};

export default globalErrorHandler;