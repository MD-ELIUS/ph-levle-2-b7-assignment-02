import type { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import sendResponse from "../utility/sendResponse";

const notFound = (req: Request, res: Response) => {
  sendResponse(res, {
    statusCode: StatusCodes.NOT_FOUND,
    success: false,
    message: "Route not found",
  });
};

export default notFound;