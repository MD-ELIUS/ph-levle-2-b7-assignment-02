import { StatusCodes } from "http-status-codes";
import type { IIssue } from "../../types";
import { pool } from "../../db";


const createIssueInDB = async (payload: IIssue) => {
    const { title, description, type, reporter_id } = payload;

     if (!title || !description || !type) {

        const err: any = new Error("Title, description, and type are required");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

      if (title.length > 150) {
        const err: any = new Error("Title must not exceed 150 characters");
        err.statusCode =StatusCodes.BAD_REQUEST
        throw err;
    }
    if (description.length < 20) {
        const err: any = new Error("Description must be at least 20 characters");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

     if (!["bug", "feature_request"].includes(type)) {
        const err: any = new Error("Type must be either bug or feature_request");
         err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

    const result = await pool.query(
        `INSERT INTO issues (title, description, type, status, reporter_id) 
         VALUES ($1, $2, $3, 'open', $4) 
         RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
        [title, description, type, reporter_id]
    );
    return result;





}


export const issueService = {
    createIssueInDB
}