import { Pool } from "pg";
import config from "../config";

export const pool = new Pool({
    connectionString: config.connection_string,
});


export const initDB = async () => {
    try {
           await pool.query("SELECT NOW()");
        console.log("Database connection established successfully.");

    } catch (error) {
        console.log(error)
    }
}