import dotenv from 'dotenv';
import Hierarchy from "../models/hierarchy.model.js";
import Request from "../models/request.model.js";
import { generatePermissionToken } from './common.js';
// import { sendMailByInitiator, sendMailToInitiatorToApprove } from './mailer.js';
import Form from '../models/form.model.js';
import { sendForm } from './mailer.js';
import { ApiResponse } from '../util/ApiResponse.js';

// Load environment variables from .env file
dotenv.config();


export const calculateDaysSince = (createdAt) => {
  const today = new Date(); // Get today's date
  const createdDate = new Date(createdAt); // Convert createdAt to a Date object

  // Calculate the difference in time
  const timeDifference = today - createdDate;

  // Convert time difference from milliseconds to days
  const daysDifference = timeDifference / (1000 * 3600 * 24);

  return Math.floor(daysDifference); // Return the integer part of the difference
}


export const getSbu = (value) => {
  // Generate a random 6-digit OTP
  let parts = value.split(' ');
  let number = parts[1];

  // Pad the number to ensure it is at least 2 digits long
  let sbuCode = parts[0] + number.padStart(2, '0');

  return sbuCode;
};

export const findRequestAndHierarchy = async (id) => {
  const request = await Request.findOne({ slNo: id }).populate("formId");
  if (!request) throw new ApiError(404, "Request not found");


  const filtersArray = getFilterArray(request.formId)
  if (!filtersArray.length) throw new ApiError(404, "Hierarchy not found");


  const hierarchies = await Hierarchy.findOne({
    filters: { $all: filtersArray, $size: filtersArray.length }
  }).select("steps");

  if (!hierarchies) throw new ApiError(404, "Hierarchy not found");

  return { request, hierarchies };
};

export const updatePreviousRecipients = (previousRecipients, email, status, comment) => {
  previousRecipients.forEach((prevRecipient) => {
    if (prevRecipient.email === email) {
      prevRecipient.status = status;
      prevRecipient.comment = comment || '';
      prevRecipient.created = prevRecipient.created ? prevRecipient.created : Date.now();
    } else {
      prevRecipient.status = "Parallel Approved";
      prevRecipient.created = prevRecipient.created ? prevRecipient.created : Date.now();
    }
  });
};

export const generateAndSendEmails = async (recipients, request) => {
  const requestWithForm = await Request.findOne({ slNo: request.slNo }).populate("formId");
  if (recipients.length > 0) {
    for (const recipient of recipients) {
      const { email, name } = recipient;
      if (!email) continue;

      const token = generatePermissionToken({ id: request?.slNo, email });

      // send email to other approvals

      const mailSubject = `Request #${request.slNo} for your review / Replacement Request / Cust.ID-${request?.formId?.customerCode} / Complaint or Work Order No.: ${request?.formId?.complainNo}`;
      const text = "You have been requested to review the following and take necessary action according to company policy & procedures."

      const url = `${process.env.APPROVAL_URL}/approval?token=${token}`;
      await sendForm(requestWithForm, email, url, mailSubject, text);
    }

  } else {

    //Send mail while request is Approved 
    const mailSubject = `Request #${request.slNo} has Approved / Replacement Request / Cust.ID-${request?.formId?.customerCode} / Complaint or Work Order No.: ${request?.formId?.complainNo}`;
    const text = "We are pleased to inform you that your form has been approved. Further actions will be taken as per company policy."
    await sendForm(requestWithForm, request.formId.initiatorId, null, mailSubject, text);


  }

};
export const generateTokens = async (recipients, request, assignedEmails, stepUpdate) => {
  for (const recipient of recipients) {
    const { email, name } = recipient;
    if (!email) continue;

    const token = generatePermissionToken({ id: request?.slNo, email });

    assignedEmails.push({ email, token });
    stepUpdate.push({ email });

  }
};

export const processApprovedStatus = async (req, request, hierarchies, stepField, stepField2) => {
  const { id, email } = req.user;
  const { status, comment, warehouse, replacementOrderNo } = req.body;
  console.log('replacementOrderNo:', replacementOrderNo)
  const assignedEmails = [];
  const stepUpdate = [];
  let previousRecipients = request[stepField];

  const recipients = hierarchies.steps[request.currentStep]?.accept || [];
  let position = [hierarchies.steps[request.currentStep]?.position];

  warehouse?.email && position.push("Warehouse");

  const filteredRecipients = evaluateApprovals(recipients, request?.formId);
  warehouse?.email && filteredRecipients.push({ email: warehouse?.email, name: warehouse?.name });
  await generateTokens(filteredRecipients, request, assignedEmails, stepUpdate);

  updatePreviousRecipients(previousRecipients, email, "Approved", comment);

  if (recipients.length > 0) {
    request.assignedEmail = assignedEmails;
    request.pendingPosition = position;
    request[stepField] = previousRecipients;
    request[stepField2] = filteredRecipients;
    request.currentStep += 1;
  } else {
    request.assignedEmail = [];
    request.pendingPosition = [];
    request[stepField] = previousRecipients;
    request.status = status
    await Form.findOneAndUpdate({ slNo: id }, { status })
  }
  await request.save();
  replacementOrderNo && await Form.findOneAndUpdate({ slNo: id }, { replacementOrderNo })
  await generateAndSendEmails(filteredRecipients, request);


};

export const processDeclinedStatus = async (req, res, request, hierarchies, stepField) => {
  const { id, email } = req.user;
  const { status, comment } = req.body;
  const recipients = hierarchies.steps[request.currentStep]?.decline || [];
  let previousRecipients = request[stepField];
  updatePreviousRecipients(previousRecipients, email, status, comment);

  request.assignedEmail = [];
  request.pendingPosition = [];
  request[stepField] = previousRecipients;
  request.status = status

  await request.save();

  await Form.findByIdAndUpdate(request.formId._id, { status });
  const mailSubject = `Request #${request.slNo} Declined / Replacement Request / Cust.ID-${request?.formId?.customerCode} / Complaint or Work Order No.: ${request?.formId?.complainNo}`;
  const text = "We regret to inform you that your form has been declined based on company policy. For any questions or clarifications, feel free to reach out."
  await sendForm(request, request.formId.initiatorId, null, mailSubject, text);

  return res.status(200).json(new ApiResponse(200, request, 'Form Declined successfully', { assignedEmails: [] }));
};

export const processMoreInfoStatus = async (req, res, request, hierarchies) => {
  const recipients = hierarchies.steps[request.currentStep]?.moreInfo || [];
  const updatedRequest = await Request.findOneAndUpdate({ slNo: req.user.id }, { status: "More Info" }, { new: true });

  await Form.findByIdAndUpdate(request.formId._id, { status: "More Info" });
  await sendMailToInitiatorToDecline(updatedRequest, request.formId.initiatorId);

  return res.status(200).json(new ApiResponse(200, request, 'More Info Requested successfully', { assignedEmails: [] }));
};




export const evaluateApprovals = (step, formData) => {
  const approvals = [];

  function checkCondition(condition, formData) {
    const { field, operator, value } = condition;
    const fieldValue = formData[field];

    const isDate = !isNaN(Date.parse(fieldValue));

    if (isDate) {
      const daysSince = calculateDaysSince(fieldValue);
      switch (operator) {
        case 'equals':
          return daysSince === value;
        case 'notEquals':
          return daysSince !== value;
        case 'greaterThan':
          return daysSince > value;
        case 'lessThan':
          return daysSince < value;
        case 'greaterThanEqual':
          return daysSince >= value;
        case 'lessThanEqual':
          return daysSince <= value;
        default:
          return false;
      }
    }

    switch (operator) {
      case 'equals':
        return fieldValue === value;
      case 'notEquals':
        return fieldValue !== value;
      case 'greaterThan':
        return fieldValue > value;
      case 'lessThan':
        return fieldValue < value;
      case 'greaterThanEqual':
        return fieldValue >= value;
      case 'lessThanEqual':
        return fieldValue <= value;
      case 'include':
        return value.includes(fieldValue);
      default:
        return false;
    }
  }

  step.forEach(item => {
    const conditionsMet = item.conditions.every(condition => checkCondition(condition, formData));

    if (conditionsMet) {
      approvals.push({
        email: item.email,
        name: item.name
      });
    }
  });

  return approvals;
};



export const getFilterArray = (formData) => {
  const { category, severeness, region, policyStatus, purchasedFrom, invoiceDate, installationDate, productCategory } = formData;

  if (category === "Product-Replacement") {
    if (severeness === "Escalation") {
      return [category, severeness, region, policyStatus === "Within Policy" ? "Warranty" : "Non-Warranty"];
    } else {
      const day = productCategory === "Water Purifier" ? calculateDaysSince(installationDate) : calculateDaysSince(invoiceDate)
      if (day < 11) {
        return [category, severeness, region, "lessThenTenDays"]

      }
      else if (day < 10 || purchasedFrom === "Forbes Pro") {
        return [category, severeness, region, "afterTenDays", "Forbes Pro"]

      }
      else if ((day >= 11 && day <= 31) && purchasedFrom !== "Forbes Pro") {
    
        return [category, severeness, region, "beforeMonth", "All Product"]

      } else if (day > 31 && purchasedFrom !== "Forbes Pro") {
        return [category, severeness, region, "afterMonth", "All Product"]
      } else {
        return []
      }
    }
  }
  return []

};


