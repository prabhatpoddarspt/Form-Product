import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Admin from "../models/admin.model.js";
import { sendEmail } from "../util/sendEmail.js";
import ExcelJS from 'exceljs';

// Create a new admin (Already existing `register` function)
const createAdmin = asyncHandler(async (req, res) => {
  const userData = req.body;

  try {
    const existingUser = await Admin.findOne({ email: userData.email })
    if (existingUser) {
      return res.status(400).json(new ApiError(400, "User Already Exist"));
    }

    const newAdmin = await Admin.create({ ...userData, userType: "ADMIN", password: "password123" });

    const mailOptions = {
      from: "refundreplace.acctssupport@eurekaforbes.com", // Sender email address
      to: userData.email, // Recipient email address
      subject: "Welcome to Eurekaforbes - Your Account Details", // Email subject
      text: `Dear ${userData.username},

Welcome aboard! We're thrilled to have you as part of the Eurekaforbes community. 

Here are your login details:
- Email: ${userData.email}
- Password: password123

To access your account, simply click the link below:
[Login Panel]: https://businessautomation-admin.eurekaforbes.co.in/

You can use the username and password provided above to log in. If you did not register for an account, please contact our support team immediately.

Thank you for choosing Eurekaforbes! We're excited to have you with us.

Best regards,  
Eurekaforbes Team`,
    };
    await sendEmail(mailOptions);
    return res
      .status(201)
      .json(new ApiResponse(200, "Admin created successfully", newAdmin));
  } catch (err) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong during admin creation"));
  }
});

// Get all admins
const getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;

    // Create a query object based on the search criteria
    const query = { userType: "ADMIN", deleted: false };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } }, // case-insensitive search for username
        { email: { $regex: search, $options: "i" } }     // case-insensitive search for email
      ];
    }

    // Calculate skip and limit values for pagination
    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    // Fetch admins with pagination
    const admins = await Admin.find(query)
      .select("status profileImg email username")
      .skip(skip)
      .limit(parseInt(limit, 10))
      .lean(); // Returns plain JS objects instead of Mongoose documents

    // Get total count of matching documents
    const total = await Admin.countDocuments(query);

    return res
      .status(200)
      .json(new ApiResponse(200,
        {
          admins: admins, total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages: Math.ceil(total / limit)
        }, "Admin get successfully"));

  } catch (err) {
    return res.status(400).json(new ApiError(400, "Something went wrong while fetching admins"));
  }
});

const exportAdminsToExcel = asyncHandler(async (req, res) => {
  try {
    const { search } = req.query;

    // Create a query object based on the search criteria
    const query = { userType: "ADMIN", deleted: false };

    if (search) {
      query.$or = [
        { username: { $regex: search, $options: "i" } }, // case-insensitive search for username
        { email: { $regex: search, $options: "i" } }     // case-insensitive search for email
      ];
    }

    // Fetch admins with pagination (pagination is not necessary for the Excel export, but it's still in place)
    const admins = await Admin.find(query)
      .select("status profileImg email username")
      .lean(); // Returns plain JS objects instead of Mongoose documents

    if (!admins.length) {
      return res.status(404).json(new ApiError(404, "No admins found"));
    }

    // Create a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Admins');

    // Define the columns in the worksheet
    worksheet.columns = [
      { header: 'Username', key: 'username', width: 20 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Profile Image', key: 'profileImg', width: 40 },
      { header: 'Status', key: 'status', width: 10 },
    ];

    // Add rows of data from the admin list
    admins.forEach(admin => {
      worksheet.addRow({
        username: admin.username,
        email: admin.email,
        profileImg: admin.profileImg,
        status: admin.status ? 'Active' : 'Inactive',
      });
    });

    // Set response headers to download the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=admins.xlsx');

    // Write the workbook to the response stream
    await workbook.xlsx.write(res);
    res.end();

  } catch (err) {
    return res.status(400).json(new ApiError(400, "Something went wrong while exporting admins"));
  }
});

// Get a single admin by ID
const getAdminById = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    const admin = await Admin.findById(id)
      .select("status profileImg email username")
      .lean()
      ;
    if (!admin) {
      return res
        .status(404)
        .json(new ApiError(404, "Admin not found"));
    }
    return res
      .status(200)
      .json(new ApiResponse(200, admin, "Admin retrieved successfully"));
  } catch (err) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong while fetching the admin"));
  }
});

// Update an existing admin
const updateAdmin = asyncHandler(async (req, res) => {
  const { id } = req.query;
  const updates = req.body;

  try {
    const admin = await Admin.findById(id);
    if (!admin) {
      return res
        .status(404)
        .json(new ApiError(404, "Admin not found"));
    }

    // Update the admin details
    Object.assign(admin, updates);
    await admin.save();

    return res
      .status(200)
      .json(new ApiResponse(200, admin, "Admin updated successfully"));
  } catch (err) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong while updating the admin"));
  }
});

const deleteAdmin = asyncHandler(async (req, res) => {
  const { id } = req.query;

  try {
    const admin = await Admin.findByIdAndDelete(id);
    if (!admin) {
      return res
        .status(404)
        .json(new ApiError(404, "Admin not found"));
    }



    return res
      .status(200)
      .json(new ApiResponse(200, admin, "Admin updated successfully"));
  } catch (err) {
    return res
      .status(400)
      .json(new ApiError(400, "Something went wrong while updating the admin"));
  }
});

// Delete an admin

export { createAdmin, getAllAdmins, getAdminById, updateAdmin, deleteAdmin, exportAdminsToExcel };
