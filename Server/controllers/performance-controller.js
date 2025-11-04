import Performance from "../models/performance-model.js"
import Employee from "../models/employee-model.js"

const projectProjection = {
  CID: 1, projectName: 1, clientName: 1, role: 1, startDate: 1, endDate: 1, status: 1, feedbacks: 1
}

const addDerivedMetrics = (docs) => {
  return docs.map((d) => {
    const feedbacks = d.feedbacks || []
    const feedbackCount = feedbacks.length
    const avgRating = feedbackCount > 0 ? Number((feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbackCount).toFixed(2)) : 0
    const lastFeedbackDate = feedbackCount > 0 ? feedbacks[feedbacks.length - 1].date : null
    return { ...d.toObject(), feedbackCount, avgRating, lastFeedbackDate }
  })
}

export const assignProject = async (req, res) => {
  try {
    const { CID, projectName, clientName, role, startDate, endDate, status } = req.body
    if (!CID) return res.status(400).json({ success: false, message: "CID is required" })
    if (!projectName) return res.status(400).json({ success: false, message: "projectName is required" })

    const emp = await Employee.findOne({ CID })
    if (!emp) return res.status(404).json({ success: false, message: `No employee found with CID: ${CID}` })

    const saved = await Performance.create({
      CID,
      projectName,
      clientName,
      role,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      status: status || 'active',
    })

    return res.status(201).json({ success: true, data: saved })
  } catch (error) {
    console.error("Error assigning project:", error)
    return res.status(500).json({ success: false, message: "Failed to assign project", error: error.message })
  }
}

export const addFeedback = async (req, res) => {
  try {
    const { performanceId, date, rating, comment, givenBy } = req.body
    if (!performanceId) return res.status(400).json({ success: false, message: "performanceId is required" })
    if (!rating) return res.status(400).json({ success: false, message: "rating is required" })

    const perf = await Performance.findById(performanceId)
    if (!perf) return res.status(404).json({ success: false, message: "Performance record not found" })

    perf.feedbacks.push({ date: date ? new Date(date) : new Date(), rating, comment, givenBy })
    await perf.save()

    return res.status(201).json({ success: true, data: perf })
  } catch (error) {
    console.error("Error adding feedback:", error)
    return res.status(500).json({ success: false, message: "Failed to add feedback", error: error.message })
  }
}

export const getAllPerformance = async (req, res) => {
  try {
    const docs = await Performance.find({}, projectProjection).sort({ updatedAt: -1 })
    const withMetrics = addDerivedMetrics(docs)

    // attach employee name/department via map
    const cids = [...new Set(withMetrics.map(d => d.CID))]
    const employees = await Employee.find({ CID: { $in: cids }}, { CID: 1, name: 1, department: 1 })
    const map = Object.fromEntries(employees.map(e => [e.CID, { name: e.name, department: e.department }]))
    const enriched = withMetrics.map(d => ({ ...d, employee: map[d.CID] || {} }))

    return res.status(200).json({ success: true, data: enriched })
  } catch (error) {
    console.error("Error fetching performance:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch performance", error: error.message })
  }
}

export const getPerformanceByCID = async (req, res) => {
  try {
    const { CID } = req.params
    if (!CID) return res.status(400).json({ success: false, message: "CID is required" })

    const docs = await Performance.find({ CID }, projectProjection).sort({ updatedAt: -1 })
    const withMetrics = addDerivedMetrics(docs)
    return res.status(200).json({ success: true, CID, data: withMetrics })
  } catch (error) {
    console.error("Error fetching performance by CID:", error)
    return res.status(500).json({ success: false, message: "Failed to fetch performance", error: error.message })
  }
}
