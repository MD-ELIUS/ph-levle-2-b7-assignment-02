import express, { type Application, type Request, type Response } from "express"

const app : Application = express()


app.use(express.json())


app.get('/', (req : Request, res : Response) => {

 res.status(200).json({
    "message" : "Next Level DevPulse Assignment-02 B7!",
    "author" : "MD. ELIUS "
 })
})

export default app