import Employee from "../models/employee-model.js";

// Helper to remove empty values so Mongoose defaults can apply
const cleanObject = (obj) => {
      if (Array.isArray(obj)) return obj.map(cleanObject).filter(v => v !== undefined)
      if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach((key) => {
                  const val = obj[key]
                  if (val === '' || val === null || val === undefined) {
                        delete obj[key]
                  } else if (typeof val === 'object') {
                        const cleaned = cleanObject(val)
                        if (typeof cleaned === 'object' && !Array.isArray(cleaned) && Object.keys(cleaned).length === 0) {
                              delete obj[key]
                        } else {
                              obj[key] = cleaned
                        }
                  }
            })
            return obj
      }
      return obj
}

export const addEmployee = async (req, res) => {
      try {
            let employeesData = Array.isArray(req.body) ? req.body : [req.body];

            // Clean incoming data to allow defaults to populate
            employeesData = employeesData.map((emp) => cleanObject({ ...emp }))

            // Extract all CIDs from incoming data
            const incomingCIDs = employeesData.map(emp => emp.CID).filter(Boolean);

            // Find existing employees with same CIDs
            const existing = await Employee.find({ CID: { $in: incomingCIDs } });

            if (existing.length > 0) {
                  // Get list of duplicate CIDs
                  const duplicateCIDs = existing.map(emp => emp.CID);
                  return res.status(400).json({
                        success: false,
                        message: `Employee(s) with the following CID already exist: ${duplicateCIDs.join(", ")}`
                  });
            }

            // No duplicates → insert new employees
            const savedEmployees = await Employee.insertMany(employeesData);

            res.status(201).json({
                  success: true,
                  message:
                        savedEmployees.length > 1
                              ? `${savedEmployees.length} employees added successfully`
                              : "Employee added successfully",
                  data: savedEmployees
            });
      } catch (error) {
            console.error("Error adding employee(s):", error);
            res.status(500).json({
                  success: false,
                  message: "Failed to add employee(s)",
                  error: error.message
            });
      }
};

export const getEmployees = async (req, res) => {
      try {
            const employees = await Employee.find({});
            res.status(200).json({ employees });
      } catch (error) {
            console.error("Error fetching employees:", error);
            res.status(500).json({
                  success: false,
                  message: "Failed to fetch employees",
                  error: error.message
            });
      }
};

// Get single employee by CID
export const getEmployeeByCID = async (req, res) => {
      try {
            const { CID } = req.params;

            if (!CID) {
                  return res.status(400).json({
                        success: false,
                        message: "CID is required"
                  });
            }

            const employee = await Employee.findOne({ CID });

            if (!employee) {
                  return res.status(404).json({
                        success: false,
                        message: `No employee found with CID: ${CID}`
                  });
            }

            res.status(200).json({
                  success: true,
                  employee
            });
      } catch (error) {
            console.error("Error fetching employee:", error);
            res.status(500).json({
                  success: false,
                  message: "Failed to fetch employee",
                  error: error.message
            });
      }
};

export const deleteEmployee = async (req, res) => {
      try {
            const { CID } = req.params;

            // Check if employee exists
            const employee = await Employee.findOne({ CID });
            if (!employee) {
                  return res.status(404).json({
                        success: false,
                        message: `No employee found with CID: ${CID}`
                  });
            }

            // Delete the employee
            await Employee.deleteOne({ CID });

            res.status(200).json({
                  success: true,
                  message: `Employee with CID ${CID} deleted successfully`
            });
      } catch (error) {
            console.error("Error deleting employee:", error);
            res.status(500).json({
                  success: false,
                  message: "Failed to delete employee",
                  error: error.message
            });
      }
};
