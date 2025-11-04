import { Schema, model } from "mongoose"

const attendanceSchema = new Schema({
  CID: { type: String, required: true, index: true },
  date: { type: Date, required: true },
  type: { type: String, enum: ["attendance", "event"], default: "attendance" },
  status: { type: String, enum: ["present", "absent", "leave"], default: "present" },
  eventType: { type: String, enum: ["salary-credit", "birthday", "holiday", "work-anniversary", "custom"], default: undefined },
  checkIn: { type: String },
  checkOut: { type: String },
  notes: { type: String },
}, { timestamps: true })

const Attendance = model("Attendance", attendanceSchema)
export default Attendance
