import type { NextFunction, Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";

const createIssue = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const reporterId = req.user!.id; // extracted from valid token
        const result = await issueService.createIssueInDB({...req.body, reporter_id: reporterId });

          sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message:  "Issue created successfully",
            data: result.rows[0],
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


export const issueController = {
    createIssue
}
