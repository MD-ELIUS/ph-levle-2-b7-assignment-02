import express, { type Application, type Request, type Response } from "express"
import { authRoute } from "./modules/auth/auth.route"
import globalErrorHandler from "./middleware/globalErrorhandler";
import { issueRoute } from "./modules/issue/issue.route";
import cors from "cors";
import config from "./config";

const app : Application = express()


app.use(express.json())
app.use(express.text()) ;
app.use(express.urlencoded({ extended: true }))
app.use(cors({
    origin: config.url
}))

app.get('/', (req : Request, res : Response) => {

 res.status(200).json({
    "message" : "Next Level DevPulse Assignment-02 B7!",
    "author" : "MD. ELIUS "
 })
})


app.use("/api/auth", authRoute )
app.use("/api/issues", issueRoute);



// Global Error Handling Middleware
app.use(globalErrorHandler);

export default app