import { Schema, model } from "mongoose"

const employeeSchema = new Schema({
      name: {
            type: String,
            default: "Heet Keyur Shah",
      },
      role: {
            type: String,
            default: "Technology Analyst",
      },
      CID: {
            type: String,
            default: "CID000",
      },
      gender: {
            type: String,
            default: "Male",
      },
      dob: {
            type: Date,
            default: new Date("2005-08-07"),
      },
      email: {
            type: String,
            default: "heets4307@gmail.com",
      },
      address: {
            type: String,
            default: "Bhavan's Campus, Old D N Nagar, Munshi Nagar, Andheri West, Mumbai, Maharashtra 400058",
      },
      picture: {
            type: String,
            default: "https://avatar.iran.liara.run/public", 
      },
      phoneNumber: {
            type: String,
            default: "7774910883",
      },
      salary: {
            type: Number,
            default: 75000,
      },
      documents: {
            aadharCard: {
                  type: String,
                  default: "https://example.com/default-aadhar.pdf",
            },
            panCard: {
                  type: String,
                  default: "https://example.com/default-pan.pdf",
            },
            drivingLicense: {
                  type: String,
                  default: "https://example.com/default-license.pdf",
            },
            resume: {
                  type: String,
                  default: "https://example.com/default-resume.pdf",
            },
      },
}, { timestamps: true });

const employee = model("Employee", employeeSchema);
export default employee;
