import { asyncHandler } from "../util/asyncHandler.js";
import { ApiError } from "../util/ApiErrors.js";
import { ApiResponse } from "../util/ApiResponse.js";
import Form from "../models/form.model.js";
import Notification from "../models/notification.model.js";
import Hierarchy from "../models/hierarchy.model.js";
import Request from "../models/request.model.js";
import ExcelJS from "exceljs"

import { sendForm } from "../helper/mailer.js";
import { calculateDaysSince, generatePermissionToken, getSbu } from "../helper/common.js";
import axios from "axios";
import { evaluateApprovals, findRequestAndHierarchy, getFilterArray, processApprovedStatus, processDeclinedStatus, processMoreInfoStatus } from "../helper/approvals.js";

// Helper function to encrypt data


// Create a new form
const createForm = asyncHandler(async (req, res) => {
    const formData = req.body;
    const filterArray= getFilterArray(formData)


    if (!filterArray.length) {
        return res.status(404).json(new ApiError(404, "Hierarchy not found"));
    }

    // Find documents where the filters array exactly matches
    const hierarchies = await Hierarchy.findOne({
        filters: { $all: filterArray, $size: filterArray.length }
    }).select("steps");

    if (!hierarchies) {
        return res.status(404).json(new ApiError(404, "Hierarchy not found"));
    }

    const recipients = hierarchies.steps[0]?.accept || [];
    // console.log('recipients:', recipients)
    const position = hierarchies.steps[0]?.position || "";
    const assignedEmails = [];
    const step1 = [];
    const form = await Form.create(formData);
    await Notification.create({ email: formData.initiatorId })

    const filterRecipients = evaluateApprovals(recipients, formData)

    // Iterate through each recipient, generate tokens, and send emails
    for (const recipient of filterRecipients) {
        const { email } = recipient;
        if (!email) continue;
        // Add email to the assignedEmails array
        const token = generatePermissionToken({ id: form?.slNo, email });

        assignedEmails.push({ email, token });
        step1.push({ email });
    }


    // Store the assignedEmails in the request
    const requestData = await Request.create({
        totalRecipients: hierarchies?.steps?.length || 0, formId: form?._id, region: form.region, category: form.category, sbu: form.sbu, slNo: form.slNo, pendingPosition: position,
        assignedEmail: assignedEmails,// Store all assigned emails
        step1: step1
    });

    const updatedRequest = await Request.findById(requestData._id).populate("formId")

    // Iterate through each recipient, generate tokens, and send emails
    for (const recipient of filterRecipients) {
        const { email } = recipient;
        if (!email) continue;

        // Generate token for each email
        const token = generatePermissionToken({ id: form?.slNo, email });
        // Generate URL for approval
        const url = `${process.env.APPROVAL_URL}/approval?token=${token}`;

        // Send email
        const mailSubject = `Request #${updatedRequest.slNo} for your review / Replacement Request / Cust.ID-${updatedRequest?.formId?.customerCode} / Complaint or Work Order No.: ${updatedRequest?.formId?.complainNo}`;
        const text = "You have been requested to review the following and take \n necessary action according to company policy & procedures."
        await sendForm(updatedRequest, email, url, mailSubject, text);
    }

    const mailSubject = `Request #${updatedRequest.slNo} Submitted Successfully / Replacement Request / Cust.ID-${updatedRequest?.formId?.customerCode} / Complaint or Work Order No.: ${updatedRequest?.formId?.complainNo}`;
    const text = " Your form has been successfully submitted and is under review. We will take necessary action according to company policy."

    await sendForm(updatedRequest, form.initiatorId, null, mailSubject, text)

    // Respond with success
    return res.status(201).json(new ApiResponse(201, requestData, "Form created successfully", { assignedEmails }));
});


const acceptForm = asyncHandler(async (req, res) => {
    const { id, email } = req.user;
    const { status, warehouse } = req.body;

    const { request, hierarchies } = await findRequestAndHierarchy(id);
    const stepField = `step${request.currentStep}`;
    const stepField2 = `step${request.currentStep + 1}`;

    if (status === "Approved") {
        await processApprovedStatus(req, request, hierarchies, stepField, stepField2);
    } else if (status === "Declined") {
        return await processDeclinedStatus(req, res, request, hierarchies, stepField);
    } else if (status === "More Info") {
        return await processMoreInfoStatus(req, res, request, hierarchies);
    }

    return res.status(200).json(new ApiResponse(200, request, `Form ${status}ed successfully`, { assignedEmails: request.assignedEmail }));
});






export {
    createForm,
    acceptForm
};
