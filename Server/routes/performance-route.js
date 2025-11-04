import express from "express"
import { assignProject, addFeedback, getAllPerformance, getPerformanceByCID } from "../controllers/performance-controller.js"

const performanceRouter = express.Router()

performanceRouter.post('/performance/assign', assignProject)
performanceRouter.post('/performance/feedback', addFeedback)
performanceRouter.get('/performance', getAllPerformance)
performanceRouter.get('/performance/:CID', getPerformanceByCID)

export default performanceRouter
