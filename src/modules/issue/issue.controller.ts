import type { NextFunction, Request, Response } from "express";
import { issueService } from "./issue.service";
import sendResponse from "../../utility/sendResponse";
import { StatusCodes } from "http-status-codes";
import type { CustomError, IUpdateIssue, IUser } from "../../types";

const createIssue = async (req: Request, res: Response, next: NextFunction) => {

    try {

        const reporterId = req.user!.id;
        const result = await issueService.createIssueInDB({ ...req.body, reporter_id: reporterId });

        sendResponse(res, {
            statusCode: StatusCodes.CREATED,
            success: true,
            message: "Issue created successfully",
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

const getAllIssues = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await issueService.getAllIssuesFromDB(req.query);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Issues retrieved successfully",
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
    } catch (error) {
        const err = error as CustomError;
        sendResponse(res, {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: err.message,
            error: err
        })
    }
};

export const updateIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const id = req.params.id;

        const currentUser = req.user as IUser & { id: number };

        const payload: IUpdateIssue = req.body;

        const result = await issueService.updateIssueInDB(id as string, payload, currentUser);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Issue updated successfully",
            data: result,
        });
    } catch (error) {
        const err = error as CustomError;
        sendResponse(res, {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: err.message,
            error: err
        })
    }
};

const deleteIssue = async (req: Request, res: Response, next: NextFunction) => {
    try {
        await issueService.deleteIssueFromDB(req.params.id as string);

        sendResponse(res, {
            statusCode: StatusCodes.OK,
            success: true,
            message: "Issue deleted successfully"

        });

    } catch (error) {
        const err = error as CustomError;
        sendResponse(res, {
            statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
            success: false,
            message: err.message,
            error: err
        })
    }
};


export const issueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
}
