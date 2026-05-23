import { StatusCodes } from "http-status-codes";
import type { CustomError, IIssue, IIssueQueryParams, IUpdateIssue, IUser } from "../../types";
import { pool } from "../../db";
import sendResponse from "../../utility/sendResponse";


const createIssueInDB = async (payload: IIssue) => {
    const { title, description, type, reporter_id } = payload;

    if (!title || !description || !type) {

        const err: any = new Error("Title, description, and type are required");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

    if (title.length > 150) {
        const err: any = new Error("Title must not exceed 150 characters");
        err.statusCode = StatusCodes.BAD_REQUEST
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


const getAllIssuesFromDB = async (queryParams: IIssueQueryParams) => {
    const { sort, type, status } = queryParams;
    let baseQuery = `SELECT * FROM issues`;
    const filterClauses: string[] = [];
    const values: (string | number | boolean | null)[] = [];

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
        const err: CustomError = new Error("Issue not found");
        err.statusCode = StatusCodes.NOT_FOUND;
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

const updateIssueInDB = async (
  id: string,
  payload: IUpdateIssue,
  currentUser: IUser & { id: number }
) => {
 
  const { title, description, type, status } = payload;

  if (!currentUser) {
    const err: CustomError = new Error("Unauthorized");
    err.statusCode = StatusCodes.UNAUTHORIZED;
    throw err;
    }

  const issueResult = await pool.query(
    `SELECT * FROM issues WHERE id = $1`,
    [id]
  );

  if (issueResult.rows.length === 0) {
    const err: CustomError = new Error("Issue not found");
    err.statusCode = StatusCodes.NOT_FOUND;
    throw err;
  }

  const issue: IIssue = issueResult.rows[0];

  
  if (currentUser.role === "contributor") {
    if (issue.reporter_id !== currentUser.id) {
      const err: CustomError = new Error(
        "Forbidden: cannot update others issue"
      );
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }

    if (issue.status !== "open") {
      const err: CustomError = new Error(
        "Conflict: only open issues can be updated"
      );
      err.statusCode = StatusCodes.CONFLICT;
      throw err;
    }

 
    if (status) {
      const err: CustomError = new Error(
        "Forbidden: contributor cannot update status"
      );
      err.statusCode = StatusCodes.FORBIDDEN;
      throw err;
    }
  }

  if (title && title.length > 150) {
    const err: CustomError = new Error("Title max 150 characters");
    err.statusCode = StatusCodes.BAD_REQUEST;
    throw err;
  }

  if (description && description.length < 20) {
    const err: CustomError = new Error("Description min 20 characters");
    err.statusCode = StatusCodes.BAD_REQUEST;
    throw err;
  }

  if (type && !["bug", "feature_request"].includes(type)) {
    const err: CustomError = new Error("Invalid type");
    err.statusCode = StatusCodes.BAD_REQUEST;
    throw err;
  }

  if (status && !["open", "in_progress", "resolved"].includes(status)) {
    const err: CustomError = new Error("Invalid status");
    err.statusCode = StatusCodes.BAD_REQUEST;
    throw err;
  }

 
  const result = await pool.query(
    `
    UPDATE issues
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      type = COALESCE($3, type),
      status = COALESCE($4, status),
      updated_at = NOW()
    WHERE id = $5
    RETURNING *
    `,
    [
      title ?? null,
      description ?? null,
      type ?? null,
      status ?? null,
      id,
    ]
  );

  return result.rows[0];
};

const deleteIssueFromDB = async (id: string) => {
    const checkIssue = await pool.query(`SELECT id FROM issues WHERE id = $1`, [id]);
    if (checkIssue.rows.length === 0) {
        const err: CustomError = new Error("Issue not found");
        err.statusCode = StatusCodes.NOT_FOUND;
        throw err;
    }
    await pool.query(`DELETE FROM issues WHERE id = $1`, [id]);
};



export const issueService = {
    createIssueInDB,
    getAllIssuesFromDB,
    getSingleIssueFromDB,
    updateIssueInDB,
    deleteIssueFromDB
}