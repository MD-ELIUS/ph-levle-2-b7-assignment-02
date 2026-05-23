import bcrypt from "bcryptjs";
import { pool } from "../../db";
import { StatusCodes } from "http-status-codes";
import jwt, { type SignOptions } from "jsonwebtoken"
import config from "../../config";

const createUserIntoDB = async (payload: any) => {
    const { name, email, password, role } = payload;

    if (!name || !email || !password) {
        const err: any = new Error("Name, email, and password must be provided");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }


    const hashedPassword = await bcrypt.hash(password, 11);

    const result = await pool.query(
        `INSERT INTO users (name, email, password, role) 
         VALUES ($1, $2, $3,  COALESCE($4, 'contributor')) 
         RETURNING *`,
        [name, email, hashedPassword, role]
    );
    //    console.log(result.rows[0])
    delete result.rows[0].password
    return result;


}

const loginUserFromDB = async (payload: {
    email: string,
    password: string
}) => {
    const { email, password } = payload;

    if (!email || !password) {
        const err: any = new Error("Email and password are required");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

    const userData = await pool.query(`
        SELECT * FROM users WHERE email=$1
        `, [email]);

       

    if (userData.rows.length === 0) {
        const err: any = new Error("Invalid credentials");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

     const user = userData.rows[0];
    
    const matchPassword = await bcrypt.compare(password, user.password);
    if (!matchPassword) {
        const err: any = new Error("Invalid credentials");
        err.statusCode = StatusCodes.BAD_REQUEST;
        throw err;
    }

    delete user.password
    

    const jwtpayload = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }

    const token = jwt.sign(jwtpayload, config.secret as string,  {expiresIn: config.access_token_expiresIn} as SignOptions)

    return {token, user}

}


export const authService = { createUserIntoDB, loginUserFromDB }