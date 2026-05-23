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


const getAllIssuesFromDB = async (queryParams: any) => {
     const { sort, type, status } = queryParams;
    let baseQuery = `SELECT * FROM issues`;
    const filterClauses: string[] = [];
    const values: any[] = [];

    // Filter by type
    if (type) {
        values.push(type);
        filterClauses.push(`type = $${values.length}`);
    }
    // Filter by status
    if (status) {
        values.push(status);
        filterClauses.push(`status = $${values.length}`);
    }

    if (filterClauses.length > 0) {
        baseQuery += ` WHERE ` + filterClauses.join(" AND ");
    }


    // Sort: newest (default) or oldest
    const orderDirection = sort === "oldest" ? "ASC" : "DESC";
    baseQuery += ` ORDER BY created_at ${orderDirection}`;
    const issuesData = await pool.query(baseQuery, values);
    const issues = issuesData.rows;
    if (issues.length === 0) return [];


   
    const reporterIds = Array.from(new Set(issues.map((i) => i.reporter_id)));

    // Fetch matching reporters
    const usersData = await pool.query(
        `SELECT id, name, role FROM users WHERE id = ANY($1)`,
        [reporterIds]
    );
    const usersMap = new Map(usersData.rows.map((u) => [u.id, u]));
    // Map reporters back to issues
    return issues.map((issue) => {
        const reporter = usersMap.get(issue.reporter_id) || null;
        const { reporter_id, ...issueDetails } = issue;
        return {
            ...issueDetails,
            reporter
        };
    });

}

const getSingleIssueFromDB = async (id: string) => {
    const issueResult = await pool.query(`SELECT * FROM issues WHERE id = $1`, [id]);
    if (issueResult.rows.length === 0) {
        const err: any = new Error("Issue not found");
        err.statusCode = 404;
        throw err;
    }
    const issue = issueResult.rows[0];
    // Fetch reporter details (No JOINs allowed)
    const reporterResult = await pool.query(
        `SELECT id, name, role FROM users WHERE id = $1`,
        [issue.reporter_id]
    );
    const reporter = reporterResult.rows[0] || null;
    const { reporter_id, ...issueDetails } = issue;
    return {
        ...issueDetails,
        reporter
    };
};


export const issueService = {
    createIssueInDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB
}