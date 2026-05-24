import type { Response } from "express"
import type { CustomError } from "../types";

type TResponse <T> = {
    statusCode: number ;
    success: boolean ;
    message : string ;
    data? : T ;
    error?: CustomError ;
}

const sendResponse = <T> (res: Response, data: TResponse<T>)  => {
    res.status(data.statusCode).json({
    success : data.success,
    message : data.message,
    data: data.data,
    error: data.error
 })
}


export default sendResponse