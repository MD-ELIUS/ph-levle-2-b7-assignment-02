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

const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await issueService.getAllIssuesFromDB(req.query);

           sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Issues retrieved successfully",
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
};



const getSingleIssue = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    try {
const result = await issueService.getSingleIssueFromDB(id as string);
         sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Issue retrieved successfully",
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
};


export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue
}
