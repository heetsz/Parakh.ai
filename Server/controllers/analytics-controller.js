import Employee from "../models/employee-model.js";
import Attendance from "../models/attendance-model.js";
import Performance from "../models/performance-model.js";
import Candidate from "../models/candidate-model.js";

export const getSummary = async (req, res) => {
  try {
    const now = new Date();
    const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Employees
    const [employeeTotal, rolesAgg, hiresByMonth] = await Promise.all([
      Employee.countDocuments(),
      Employee.aggregate([
        { $group: { _id: "$role", count: { $sum: 1 } } },
        { $project: { _id: 0, role: "$_id", count: 1 } },
        { $sort: { count: -1 } },
      ]),
      Employee.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
        { $sort: { month: 1 } },
      ]),
    ]);

    // Attendance last 30 days and events
    const [attStatusAgg, eventsAgg] = await Promise.all([
      Attendance.aggregate([
        { $match: { date: { $gte: last30 } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      Attendance.aggregate([
        { $match: { date: { $gte: last30 }, type: "event" } },
        { $group: { _id: "$eventType", count: { $sum: 1 } } },
        { $project: { _id: 0, type: "$_id", count: 1 } },
      ]),
    ]);

    // Performance
    const [activeProjects, completedProjects, perfAgg] = await Promise.all([
      Performance.countDocuments({ status: "active" }),
      Performance.countDocuments({ status: "completed" }),
      Performance.aggregate([
        { $unwind: { path: "$feedbacks", preserveNullAndEmptyArrays: true } },
        { $group: { _id: null, feedbackCount: { $sum: { $cond: [{ $ifNull: ["$feedbacks", false] }, 1, 0] } }, avgRating: { $avg: "$feedbacks.rating" } } },
        { $project: { _id: 0, feedbackCount: 1, avgRating: { $ifNull: ["$avgRating", 0] } } },
      ]),
    ]);
    const performance = {
      activeProjects,
      completedProjects,
      avgRating: perfAgg[0]?.avgRating ? Number(perfAgg[0].avgRating.toFixed(2)) : 0,
      feedbackCount: perfAgg[0]?.feedbackCount || 0,
    };

    // Candidates
    const [candTotal, statusAgg, phaseAgg, createdByMonth] = await Promise.all([
      Candidate.countDocuments(),
      Candidate.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $project: { _id: 0, status: "$_id", count: 1 } },
      ]),
      Candidate.aggregate([
        { $group: { _id: "$currentPhase", count: { $sum: 1 } } },
        { $project: { _id: 0, phase: "$_id", count: 1 } },
      ]),
      Candidate.aggregate([
        { $group: { _id: { $dateToString: { format: "%Y-%m", date: "$createdAt" } }, count: { $sum: 1 } } },
        { $project: { _id: 0, month: "$_id", count: 1 } },
        { $sort: { month: 1 } },
      ]),
    ]);

    const attendance = {
      last30: attStatusAgg.reduce((acc, cur) => ({ ...acc, [cur.status]: cur.count }), {}),
      eventsByType: eventsAgg,
    };

    const employees = { total: employeeTotal, roles: rolesAgg, hiresByMonth };
    const candidates = {
      total: candTotal,
      statusCounts: statusAgg.reduce((acc, cur) => ({ ...acc, [cur.status]: cur.count }), {}),
      phaseCounts: phaseAgg,
      createdByMonth,
    };

    return res.status(200).json({ data: { employees, attendance, performance, candidates } });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load analytics", error: err.message });
  }
};
