import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Form from "../models/form.model.js";
import Request from "../models/request.model.js";
import ExcelJS from "exceljs"

import { calculateDaysSince, generatePermissionToken, getSbu } from "../helper/common.js";



// Get all forms
const getForms = asyncHandler(async (req, res) => {
    const {
        page = 1,
        limit = 10,
        sort = 'createdAt',
        order = 'desc',
        search,
        region,
        refund,
        status,
        startDate,
        endDate
    } = req.query;

    let filter = {};
    filter.deleted = false

    // Search filter
    if (search) {
        // Check if the search starts with "REQ" (case insensitive) followed by space or hyphen and extract the number
        const reqMatch = search.match(/^REQ[-\s]?(\d+)$/i);  // Match "REQ" followed by an optional space or hyphen, then the number

        if (reqMatch) {
            // Extracted number from "REQ" pattern
            const slNoSearch = parseInt(reqMatch[1]);

            filter.$or = [
                { slNo: slNoSearch },  // Direct match for numeric slNo
            ];
        } else {
            // Normal search if "REQ" pattern is not found
            filter.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { customerCode: { $regex: search, $options: 'i' } },
                { initiaterId: { $regex: search, $options: 'i' } },
                { complainNo: { $regex: search, $options: 'i' } },
            ];
        }
    }


    // Region filter
    if (region) {
        filter.region = { $regex: region, $options: 'i' };
    }

    // Status filter
    if (status) {
        filter.status = { $regex: status, $options: 'i' };
    }

    // Refund filter
    if (refund) {
        filter.modeOfPayment = { $regex: refund, $options: 'i' };
    }

    // Date range filter on createdAt
    if (startDate || endDate) {
        filter.createdAt = {};

        if (startDate) {
            const startUtc = new Date(new Date(startDate).setUTCHours(0, 0, 0, 0));
            filter.createdAt.$gte = startUtc;
        }

        if (endDate) {
            const endUtc = new Date(new Date(endDate).setUTCHours(23, 59, 59, 999));
            filter.createdAt.$lte = endUtc;
        }
    }


    // Convert the sort order into 1 or -1
    const sortOrder = order === 'asc' ? 1 : -1;

    // Aggregation with lookup to join with the Request table
    const forms = await Form.aggregate([
        { $match: filter },  // Apply filters
        { $sort: { [sort]: sortOrder } },  // Apply sorting
        { $skip: (page - 1) * limit },  // Pagination: skip documents
        { $limit: parseInt(limit) },    // Limit number of documents
        {
            $lookup: {
                from: 'requests',  // The name of the Request collection
                localField: 'slNo',  // Field in the Form collection
                foreignField: 'slNo',  // Field in the Request collection
                as: 'requestDetails'  // The name of the array where the lookup data will be stored
            }
        },
        {
            $unwind: {  // Unwind the requestDetails if it's an array
                path: '$requestDetails',
                preserveNullAndEmptyArrays: true  // Preserve forms without a matching request
            }
        },
        {
            $project: {
                customerName: 1,
                customerCode: 1,
                employeeName: 1,
                employeeCode: 1,
                initiatorId: 1,
                complainNo: 1,
                complainDate: 1,
                purchasedFrom: 1,
                region: 1,
                sbu: 1,
                invoiceNo: 1,
                invoiceDate: 1,
                invoiceValue: 1,
                category: 1,
                severeness: 1,
                invoiceCopy: 1,
                productCode: 1,
                productName: 1,
                productSNO: 1,
                productStatus: 1,
                installationDate: 1,
                tds: 1,
                bpNameCode: 1,
                waterPressure: 1,
                complainHistory: 1,
                reason: 1,
                decision: 1,
                remark: 1,
                spareCode: 1,
                reqOrderNo: 1,
                refundRemark: 1,
                rfmClearances: 1,
                replacementOrderNo: 1,
                technicianLastVisitDate: 1,
                policyStatus: 1,
                verificationVideo: 1,
                eflRefund: 1,
                productCategory: 1,
                refundSap: 1,
                utrNo: 1,
                refundDate: 1,
                modeOfPayment: 1,
                beneficiaryHolder: 1,
                bankName: 1,
                accountNo: 1,
                ifscCode: 1,
                proofDocument: 1,
                status: 1,
                deleted: 1,
                createdAt: 1,
                updatedAt: 1,
                slNo: 1,
                // Include fields from the Request collection (requestDetails)
                'requestDetails.assignedEmail': 1,
                'requestDetails.step1': 1,
                'requestDetails.step2': 1,
                'requestDetails.step3': 1,
                'requestDetails.step4': 1,
                'requestDetails.step5': 1,
                'requestDetails.step6': 1,
                'requestDetails.step7': 1
            }
        }
    ]);

    const totalForms = await Form.countDocuments(filter);

    return res.status(200).json(new ApiResponse(200, { forms, totalForms, page, limit }, "Forms fetched successfully"));
});

const avoidDuplicate = asyncHandler(async (req, res) => {
    const {
        complainNo
    } = req.body;

    let filter = {};
    filter.deleted = false



    // Aggregation with lookup to join with the Request table
    const forms = await Form.findOne({ complainNo, deleted: false, status: { $ne: "Declined" } });
    if (forms) {
        return res.status(400).json(new ApiError(400, "Order No Already exist"));
    }


    return res.status(200).json(new ApiResponse(200, "Form can be created"));
});


const generateExcel = async (forms) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Forms Data');

    worksheet.columns = [
        { header: 'Sl No', key: 'slNo', width: 10 },
        { header: 'Time Stamp', key: 'createdAt', width: 20 },
        { header: 'Requester Email', key: 'initiaterId', width: 30 },
        { header: 'Employee Name', key: 'employeeName', width: 30 },
        { header: 'Employee Code', key: 'employeeCode', width: 30 },
        { header: 'Complain No', key: 'complainNo', width: 15 },
        { header: 'Complain Date', key: 'complainDate', width: 20 },
        { header: 'Customer Code', key: 'customerCode', width: 15 },
        { header: 'Customer Name', key: 'customerName', width: 30 },
        { header: 'Purchased From', key: 'purchasedFrom', width: 20 },
        { header: 'Region', key: 'region', width: 15 },
        { header: 'SBU', key: 'sbu', width: 15 },
        { header: 'Category', key: 'category', width: 15 },
        { header: 'Invoice No', key: 'invoiceNo', width: 20 },
        { header: 'Invoice Date', key: 'invoiceDate', width: 20 },
        { header: 'Invoice Value', key: 'invoiceValue', width: 15 },
        { header: 'Invoice Copy', key: 'invoiceCopy', width: 30 },
        { header: 'Product Code', key: 'productCode', width: 20 },
        { header: 'Product Name', key: 'productName', width: 20 },
        { header: 'Product SNO', key: 'productSNO', width: 20 },
        { header: 'Product Status', key: 'productStatus', width: 20 },
        { header: 'Installation Date', key: 'installationDate', width: 20 },
        { header: 'TDS', key: 'tds', width: 15 },
        { header: 'BP Name Code', key: 'bpNameCode', width: 15 },
        { header: 'Water Pressure', key: 'waterPressure', width: 20 },
        { header: 'Complain History', key: 'complainHistory', width: 30 },
        { header: 'Reason', key: 'reason', width: 30 },
        { header: 'Decision', key: 'decision', width: 20 },
        { header: 'Remark', key: 'remark', width: 20 },
        { header: 'Spare Code', key: 'spareCode', width: 20 },
        { header: 'Mode of Payment', key: 'modeOfPayment', width: 20 },
        { header: 'Beneficiary Holder', key: 'beneficiaryHolder', width: 25 },
        { header: 'Bank Name', key: 'bankName', width: 20 },
        { header: 'Account No', key: 'accountNo', width: 20 },
        { header: 'IFSC Code', key: 'ifscCode', width: 20 },
        { header: 'Proof Document', key: 'proofDocument', width: 30 },
        { header: 'Status', key: 'status', width: 15 },
        { header: 'Pending Days', key: 'pendingDays', width: 15 },
        { header: 'Req Order No', key: 'reqOrderNo', width: 15 },
        { header: 'Refund Remark', key: 'refundRemark', width: 15 },
        { header: 'Rfm Clearances', key: 'rfmClearances', width: 15 },
        { header: 'Refund Sap', key: 'refundSap', width: 15 },
        { header: 'Utr No', key: 'utrNo', width: 15 },
        { header: 'Refund Date', key: 'refundDate', width: 15 },
        { header: 'Pending With', key: 'assignedEmail_step1', width: 30 },
    ];

    forms.forEach(form => {
        const row = {
            slNo: form.slNo,
            createdAt: form.createdAt,
            initiaterId: form.initiaterId,
            employeeName: form.employeeName,
            employeeCode: form.employeeCode,
            complainNo: form.complainNo,
            complainDate: form.complainDate,
            customerCode: form.customerCode,
            customerName: form.customerName,
            purchasedFrom: form.purchasedFrom,
            region: form.region,
            sbu: form.sbu || '',
            category: form.category || '',
            invoiceNo: form.invoiceNo,
            invoiceDate: form.invoiceDate,
            invoiceValue: form.invoiceValue,
            invoiceCopy: form.invoiceCopy || '',
            productCode: form.productCode || '',
            productName: form.productName || '',
            productSNO: form.productSNO || '',
            productStatus: form.productStatus || '',
            installationDate: form.installationDate || '',
            tds: form.tds || '',
            bpNameCode: form.bpNameCode || '',
            waterPressure: form.waterPressure || '',
            complainHistory: form.complainHistory || '',
            reason: form.reason,
            decision: form.decision,
            remark: form.remark,
            modeOfPayment: form.modeOfPayment || '',
            beneficiaryHolder: form.beneficiaryHolder || '',
            bankName: form.bankName || '',
            spareCode: form.spareCode || '',
            accountNo: form.accountNo || '',
            ifscCode: form.ifscCode || '',
            proofDocument: form.proofDocument || '',
            status: form.status || '',
            pendingDays: calculateDaysSince(form.createdAt),
            reqOrderNo: form.reqOrderNo,
            refundRemark: form.refundRemark,
            rfmClearances: form.rfmClearances,
            refundSap: form.refundSap,
            utrNo: form.utrNo,
            refundDate: form.refundDate,
            assignedEmail_step1: form.requestDetails?.assignedEmail.length > 0 ? form.requestDetails?.assignedEmail.map(step => `${step.email}`).join(", ") : '',
        };
        worksheet.addRow(row);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
};

const exportFormsToExcel = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10000000, sort = 'createdAt', order = 'desc', search, region, refund, status, startDate, endDate } = req.query;

    let filter = {};
    if (search) {
        const reqMatch = search.match(/^REQ[-\s]?(\d+)$/i);
        if (reqMatch) {
            const slNoSearch = parseInt(reqMatch[1]);
            filter.$or = [{ slNo: slNoSearch }];
        } else {
            filter.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { customerCode: { $regex: search, $options: 'i' } },
                { initiaterId: { $regex: search, $options: 'i' } },
                { complainNo: { $regex: search, $options: 'i' } },
            ];
        }
    }

    if (region) filter.region = { $regex: region, $options: 'i' };
    if (status) filter.status = { $regex: status, $options: 'i' };
    if (refund) filter.modeOfPayment = { $regex: refund, $options: 'i' };
    if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) filter.createdAt.$gte = new Date(startDate);
        if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const forms = await Form.aggregate([
        { $match: filter },
        { $sort: { [sort]: sortOrder } },
        { $skip: (page - 1) * limit },
        { $limit: parseInt(limit) },
        { $lookup: { from: 'requests', localField: 'slNo', foreignField: 'slNo', as: 'requestDetails' } },
        { $unwind: { path: '$requestDetails', preserveNullAndEmptyArrays: true } },
        {
            $project: {
                initiaterId: 1,
                employeeCode: 1,
                employeeName: 1,
                customerName: 1,
                customerCode: 1,
                complainNo: 1,
                complainDate: 1,
                purchasedFrom: 1,
                region: 1,
                sbu: 1,
                category: 1,
                invoiceNo: 1,
                invoiceDate: 1,
                invoiceValue: 1,
                invoiceCopy: 1,
                productCode: 1,
                productName: 1,
                productSNO: 1,
                productStatus: 1,
                installationDate: 1,
                tds: 1,
                bpNameCode: 1,
                waterPressure: 1,
                complainHistory: 1,
                reason: 1,
                decision: 1,
                remark: 1,
                modeOfPayment: 1,
                beneficiaryHolder: 1,
                bankName: 1,
                spareCode: 1,
                accountNo: 1,
                ifscCode: 1,
                proofDocument: 1,
                status: 1,
                createdAt: 1,
                slNo: 1,
                reqOrderNo: 1,
                refundRemark: 1,
                rfmClearances: 1,
                refundSap: 1,
                utrNo: 1,
                refundDate: 1,
                'requestDetails.assignedEmail': 1,
            }
        }
    ]);

    const excelBuffer = await generateExcel(forms);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=forms_data.xlsx');
    return res.send(excelBuffer);
});



// Get a single form by ID
const getFormById = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const form = await Form.findById(id);

    if (!form) {
        return res.status(404).json(new ApiError(404, "Form not found"));

    }
    return res.status(200).json(new ApiResponse(200, form, "Form fetched successfully"));
});

// Update a form
const updateForm = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const formData = req.body;

    const updatedForm = await Form.findByIdAndUpdate(id, formData, { new: true });

    if (!updatedForm) {
        throw new ApiError(404, "Form not found or something went wrong");
    }

    return res.status(200).json(new ApiResponse(200, updatedForm, "Form updated successfully"));
});

const updateFormOnClick = asyncHandler(async (req, res) => {
    const { id } = req.query;
    const formData = req.body;

    const updatedForm = await Form.findByIdAndUpdate(id, formData, { new: true });

    if (!updatedForm) {
        throw new ApiError(404, "Form not found or something went wrong");
    }

    return res.status(200).json(new ApiResponse(200, updatedForm, "Form updated successfully"));
});


const reAssignTask = asyncHandler(async (req, res) => {

    // const array = [[
    //     { $match: { status: "Pending" } },
    //     { $count: "total" },

    // ]]

   Z

    return res.status(200).json(new ApiResponse(200, aggregate, "Form updated successfully"));
});


const resendEmailToUser = asyncHandler(async (req, res) => {
    const { slNo } = req.body

    // Find requests assigned to a specific email within a given date range
    const request = await Request.findOne({ slNo }).populate("formId");
    if (!request) {
        return res.status(400).json(new ApiError(400, "Request Not Found"));
    }
    if (!request.assignedEmail) {
        return res.status(400).json(new ApiError(400, "No Email assigned to this request"));
    }

    // Generate a new token for each request update
    const token = generatePermissionToken({ id: request._id, email: request?.assignedEmail });


    const url = `${process.env.FORM_URL}/approval?token=${token}`;
    await sendMailByOther(request, request?.assignedEmail, url);
    // Send a response back to the client
    return res.status(200).json(new ApiResponse(200, request, "email sent successfully"));
});

//Starting Advance logics


export {
    reAssignTask,
    getForms,
    getFormById,
    updateForm,
    avoidDuplicate,
    updateFormOnClick,
    exportFormsToExcel,
    resendEmailToUser,
};
