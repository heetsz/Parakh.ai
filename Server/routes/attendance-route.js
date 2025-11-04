import express from "express"
import { addAttendance, getAttendanceByCID } from "../controllers/attendance-controller.js"

const attendanceRouter = express.Router()

// Create attendance or special event
attendanceRouter.post('/attendance/add', addAttendance)

// Get attendance timeline for an employee by CID
attendanceRouter.get('/attendance/:CID', getAttendanceByCID)

export default attendanceRouter
