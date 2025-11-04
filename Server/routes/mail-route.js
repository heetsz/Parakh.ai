import express from "express"
import { sendEmployeeMail } from "../controllers/mail-controller.js"

const mailRouter = express.Router()

mailRouter.post('/mail/send', sendEmployeeMail)

export default mailRouter
