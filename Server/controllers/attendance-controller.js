import Attendance from "../models/attendance-model.js"
import Employee from "../models/employee-model.js"

export const addAttendance = async (req, res) => {
  try {
    const { CID, date, type = "attendance", status, eventType, checkIn, checkOut, notes } = req.body

    if (!CID) return res.status(400).json({ success: false, message: "CID is required" })
    if (!date) return res.status(400).json({ success: false, message: "date is required" })

    // Optional: verify employee exists
    const empExists = await Employee.findOne({ CID })
    if (!empExists) return res.status(404).json({ success: false, message: `No employee found with CID: ${CID}` })

    const payload = { CID, date: new Date(date), type, notes }
    if (type === "attendance") {
      payload.status = status || "present"
      if (checkIn) payload.checkIn = checkIn
      if (checkOut) payload.checkOut = checkOut
    } else if (type === "event") {
      if (!eventType) return res.status(400).json({ success: false, message: "eventType is required for event" })
      payload.eventType = eventType
    }

    const saved = await Attendance.create(payload)
    return res.status(201).json({ success: true, data: saved })
  } catch (error) {
    console.error("Error adding attendance:", error)
    return res.status(500).json({ success: false, message: "Failed to add attendance", error: error.message })
  }
}

export const getAttendanceByCID = async (req, res) => {
  try {
    const { CID } = req.params
    if (!CID) return res.status(400).json({ success: false, message: "CID is required" })

    const list = await Attendance.find({ CID }).sort({ date: -1 })
    return res.status(200).json({ success: true, CID, attendance: list })
  } catch (error) {
    console.error("Error fetching attendance:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch attendance", error: error.message })
  }
}
