import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Hierarchy from "../models/hierarchy.model.js"; // Import your Hierarchy model
import Request from "../models/request.model.js"; // Import your Hierarchy model
import ExcelJS from "exceljs"
import { getFormatDate, getFormatDateTime } from "../helper/common.js";
import { evaluateApprovals, findRequestAndHierarchy } from "../helper/approvals.js";
import UniversalHierarchy from "../models/universalHierarchy.model.js";


// Create a new Hierarchy
const createHierarchy = asyncHandler(async (req, res) => {
    const hierarchyData = req.body;

    const hierarchy = await Hierarchy.create(hierarchyData);

    if (!hierarchy) {
        return res.status(500).json(new ApiError(500, "Something went wrong while creating the hierarchy"));
    }

    return res.status(201).json(new ApiResponse(201, hierarchy, "Hierarchy created successfully"));
});

// Get all Hierarchies
const getHierarchies = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, sort = 'createdAt', order = 'desc', search } = req.query;

    let filter = {};
    filter.deleted = false


    // if (search) {
    //     filter = {
    //         $or: [
    //             { region: { $regex: search, $options: 'i' } }, // Case-insensitive search on region
    //             { type: { $regex: search, $options: 'i' } },  // Case-insensitive search on type
    //         ]
    //     };
    // }

    if (search) {
        const reqMatch = search.match(/^REQ[-\s]?(\d+)$/i);  // Match "REQ" followed by an optional space or hyphen, then the number

        if (reqMatch) {
            const slNoSearch = parseInt(reqMatch[1]);
            filter.$or = filter.$or || [];
            filter.$or.push({ slNo: slNoSearch });
        } else {
            filter.$or = [
                { region: { $regex: search, $options: 'i' } },
                { type: { $regex: search, $options: 'i' } },
            ];
        }
    }


    // Convert the sort order into 1 or -1
    const sortOrder = order === 'asc' ? 1 : -1;

    const hierarchies = await Request.find(filter)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalHierarchies = await Request.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, { hierarchies, totalHierarchies, page, limit }, "Hierarchies fetched successfully"));
});

const exportHierarchiesExcel = asyncHandler(async (req, res) => {
    const { page = 1, limit = 1000000000000, sort = 'createdAt', order = 'desc', search } = req.query;

    let filter = {};
    if (search) {
        filter = {
            $or: [
                { region: { $regex: search, $options: 'i' } }, // Case-insensitive search on region
                { type: { $regex: search, $options: 'i' } },  // Case-insensitive search on type
            ]
        };
    }

    // Convert the sort order into 1 or -1
    const sortOrder = order === 'asc' ? 1 : -1;

    // Fetch hierarchies from database
    const hierarchies = await Request.find(filter)
        .sort({ [sort]: sortOrder })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

    const totalHierarchies = await Request.countDocuments(filter);

    // Initialize a new Excel workbook and worksheet
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Hierarchies');

    // Add header row
    worksheet.columns = [
        { header: 'SL No', key: 'slNo', width: 10 },
        { header: 'Time Stamp', key: 'createdAt', width: 20 },
        { header: 'Region', key: 'region', width: 15 },
        { header: 'Category', key: 'type', width: 15 },
        { header: 'Total Recipients', key: 'totalRecipients', width: 15 },
        { header: 'SBU', key: 'sbu', width: 30 },
        { header: 'Reason', key: 'reason', width: 35 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Pending With', key: 'assignedEmail', width: 25 },

        // Step 1
        { header: 'Recipient  1 Email', key: 'step1Email', width: 30 },
        { header: 'Recipient 1 Status', key: 'step1Status', width: 15 },
        { header: 'Recipient 1 Comment', key: 'step1Comment', width: 15 },
        { header: 'Recipient 1 Issue', key: 'step1Issue', width: 25 },
        { header: 'Recipient 1 Response', key: 'step1Response', width: 25 },

        // Step 2
        { header: 'Recipient 2 Email', key: 'step2Email', width: 30 },
        { header: 'Recipient 2 Status', key: 'step2Status', width: 15 },
        { header: 'Recipient 2 Comment', key: 'step2Comment', width: 15 },
        { header: 'Recipient 2 Issue', key: 'step2Issue', width: 25 },
        { header: 'Recipient 2 Response', key: 'step2Response', width: 25 },

        // Step 3
        { header: 'Recipient 3 Email', key: 'step3Email', width: 30 },
        { header: 'Recipient 3 Status', key: 'step3Status', width: 15 },
        { header: 'Recipient 3 Comment', key: 'step3Comment', width: 15 },
        { header: 'Recipient 3 Issue', key: 'step3Issue', width: 25 },
        { header: 'Recipient 3 Response', key: 'step3Response', width: 25 },

        // Step 4
        { header: 'Recipient 4 Email', key: 'step4Email', width: 30 },
        { header: 'Recipient 4 Status', key: 'step4Status', width: 15 },
        { header: 'Recipient 4 Comment', key: 'step4Comment', width: 15 },
        { header: 'Recipient 4 Issue', key: 'step4Issue', width: 25 },
        { header: 'Recipient 4 Response', key: 'step4Response', width: 25 },

        // Step 5
        { header: 'Recipient 5 Email', key: 'step5Email', width: 30 },
        { header: 'Recipient 5 Status', key: 'step5Status', width: 15 },
        { header: 'Recipient 5 Comment', key: 'step5Comment', width: 15 },
        { header: 'Recipient 5 Issue', key: 'step5Issue', width: 25 },
        { header: 'Recipient 5 Response', key: 'step5Response', width: 25 },

        // Step 6
        { header: 'Recipient 6 Email', key: 'step6Email', width: 30 },
        { header: 'Recipient 6 Status', key: 'step6Status', width: 15 },
        { header: 'Recipient 6 Comment', key: 'step6Comment', width: 15 },
        { header: 'Recipient 6 Issue', key: 'step6Issue', width: 25 },
        { header: 'Recipient 6 Response', key: 'step6Response', width: 25 },
    ];


    // Add data rows from hierarchies
    hierarchies.forEach((hierarchy) => {
        worksheet.addRow({
            slNo: hierarchy.slNo,
            createdAt: getFormatDate(hierarchy.createdAt),
            region: hierarchy.region,
            type: hierarchy.type,
            totalRecipients: hierarchy.totalRecipients,
            sbu: hierarchy.sbu || 'N/A',
            reason: hierarchy.reason,
            status: hierarchy.status,
            assignedEmail: hierarchy?.assignedEmail?.length > 0 ? hierarchy?.assignedEmail?.map(step => `${step.email}`).join(", ") : '',

            step1Email: hierarchy?.step1?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step1Status: hierarchy?.step1?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step1Comment: hierarchy?.step1?.map(step => step.comment).join(", ") || "",
            step1Issue: hierarchy?.step1?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step1Response: hierarchy?.step1?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

            step2Email: hierarchy?.step2?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step2Status: hierarchy?.step2?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step2Comment: hierarchy?.step2?.map(step => step.comment).join(", ") || "",
            step2Issue: hierarchy?.step2?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step2Response: hierarchy?.step2?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

            step3Email: hierarchy?.step3?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step3Status: hierarchy?.step3?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step3Comment: hierarchy?.step3?.map(step => step.comment).join(", ") || "",
            step3Issue: hierarchy?.step3?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step3Response: hierarchy?.step3?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

            step4Email: hierarchy?.step4?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step4Status: hierarchy?.step4?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step4Comment: hierarchy?.step4?.map(step => step.comment).join(", ") || "",
            step4Issue: hierarchy?.step4?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step4Response: hierarchy?.step4?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

            step5Email: hierarchy?.step5?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step5Status: hierarchy?.step5?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step5Comment: hierarchy?.step5?.map(step => step.comment).join(", ") || "",
            step5Issue: hierarchy?.step5?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step5Response: hierarchy?.step5?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

            step6Email: hierarchy?.step6?.filter(step => step.status !== "Parallel Approved").map(step => `${step.email}`).join(", ") || "",
            step6Status: hierarchy?.step6?.filter(step => step.status !== "Parallel Approved").map(step => step.status).join(", ") || "",
            step6Comment: hierarchy?.step6?.map(step => step.comment).join(", ") || "",
            step6Issue: hierarchy?.step6?.map(step => getFormatDateTime(step.created)).join(", ") || "",
            step6Response: hierarchy?.step6?.map(step => step.status !== "Pending" ? getFormatDateTime(step.updatedAt) : "").join(", ") || "",

        });
    });

    // Set response headers for downloading the file
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=hierarchies.xlsx');

    // Write the workbook to the response
    await workbook.xlsx.write(res);
    res.end();
});

// Get a single form by ID
const getRequestById = asyncHandler(async (req, res) => {
    const { id, email } = req.user;
    let form = await Request.findOne({ slNo: id }).populate("formId").select("-currentToken");
    if (!form) {
        return res.status(404).json(new ApiError(404, "Form not found"));

    }
    const isAuthorized = form?.assignedEmail?.some(user => user.email === email);

    if (!isAuthorized) {
        return res.status(404).json(new ApiError(404, "You are not authorized to serve this request"));
    }


    if (form.pendingPosition.includes("SCM Desk")) {
        const { request, hierarchies } = await findRequestAndHierarchy(form.slNo);

        const recipients = hierarchies.steps[request.currentStep]?.accept || [];
        const filteredRecipients = evaluateApprovals(recipients, request?.formId);

        form = { ...form.toObject(), scmSpoc: filteredRecipients }



    }
    return res.status(200).json(new ApiResponse(200, form, "Form fetched successfully"));
});

const getRequestByIdPublic = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const form = await Request.findById(id).populate("formId").select("-currentToken");
    if (!form) {
        return res.status(404).json(new ApiError(404, "Form not found"));

    }

    return res.status(200).json(new ApiResponse(200, form, "Form fetched successfully"));
});

const getRequestByIdForAdmin = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const form = await Request.findOne({ slNo: id }).populate("formId").select("-currentToken");
    if (!form) {
        return res.status(404).json(new ApiError(404, "Form not found"));
    }

    return res.status(200).json(new ApiResponse(200, form, "Form fetched successfully"));
});



const createUniversalHierarchy = asyncHandler(async (req, res) => {
    const hierarchyData = req.body;

    console.log(hierarchyData)

    const hierarchy = await UniversalHierarchy.create(hierarchyData);

    if (!hierarchy) {
        return res.status(500).json(new ApiError(500, "Something went wrong while creating the hierarchy"));
    }

    return res.status(201).json(new ApiResponse(201, hierarchy, "Hierarchy created successfully"));
});



// Exporting the controller functions
export {
    createHierarchy,
    getHierarchies,
    getRequestById,
    getRequestByIdPublic,
    getRequestByIdForAdmin,
    exportHierarchiesExcel,
    createUniversalHierarchy
};
