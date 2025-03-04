import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { getFormatDate } from "./common.js";

// Load environment variables from .env file
dotenv.config();

// const transporter = nodemailer.createTransport({
//   host: "192.168.9.81",
//   port: 25,
//   secure: false,
//   tls: {
//     rejectUnauthorized: false,
//   },

//   debug: true, // Turn on debug to inspect connection details
// });
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendForm = (data, email, url, mailSubject, text) => {
  const mailOptions = {
    from: "refundreplace.acctssupport@eurekaforbes.com",
    to: email.toLowerCase(),
    subject: mailSubject,
    html: `<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Approval Page</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 14px;
            background-color: #f3f4f6;
        }

        .accept-btn {
            background-color: #157f3d;
            border: 1px solid #ddd;
            color: #ddd;
            padding: 8px 15px;
            cursor: pointer;
            font-size: 0.75rem;
        }

        .complete-btn {
            background-color: #b81c1d;
            border: 1px solid #ddd;
            color: #ddd;
            padding: 8px 15px;
            cursor: pointer;
            font-size: 0.75rem;
        }

        .comment-btn {
            background-color: #facd1a;
            border: 1px solid #ddd;
            padding: 8px 15px;
            cursor: pointer;
            font-size: 0.75rem;
        }

        .accept-btn:hover {
            background-color: #11552b;
        }

        .complete-btn:hover {
            background-color: #811919;
        }

        .comment-btn:hover {
            background-color: #e2e6ea;
        }

        .btn-table {
            margin: auto;
            padding: 20px;
            text-align: center;
            width: 50%;
        }

        /* Comment Section */
        .comment-section {
            margin-top: 10px;
            padding: 15px;
            border: 1px solid #ddd;
            border-radius: 5px;
        }

        .comment-section textarea {
            width: 100%;
            min-height: 80px;
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            resize: none;
            margin-top: 10px;
        }

        .comment-section button {
            margin-top: 10px;
            padding: 8px 15px;
            background-color: #007bff;
            border: none;
            color: #fff;
            cursor: pointer;
            border-radius: 5px;
        }

        .comment-section button:hover {
            background-color: #0056b3;
        }

        .buttonsTwo {
            display: flex;
            color: #007bff;
            justify-content: flex-start;
            gap: 1rem;
            cursor: pointer;
            padding-left: 1rem;
            font-size: 0.8rem;
        }

        .buttonsTwo>p:last-child {
            color: #818181;
        }

        @media (max-width: 640px) {
            .btn-table {
                width: 70%;
            }
        }

        @media (max-width: 480px) {
            .btn-table {
                width: 100%;
            }
        }

        @media (max-width: 740px) {

            .accept-btn,
            .comment-btn,
            .complete-btn {
                font-size: 0.55rem;
            }

            .buttonsTwo {
                padding-left: 0.5rem;
                gap: 0.4rem;
                font-size: 0.65rem;
            }
        }
    </style>
</head>

<body style="
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f3f4f6;
    ">
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" style="
              width: 95%;
              max-width: 800px;
              background: #ffffff;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              padding: 20px;
            ">
                    <tr>
                        <td>
                            <p style="
                 text-align:center;
                    margin-top: 10px;
                  ">
                                <span style="display: inline-block">REQUEST</span>
                                <a href="${
                                  process.env.APPROVAL_URL
                                }/request-status?id=${data?._id}">#${
      data?.formId?.slNo
    }</a>
                                <span>
                                    | RECIPIENTS: ${data.currentStep} of
                                    ${data.totalRecipients} |
                                    ${getFormatDate(data?.createdAt)}
                                </span>
                            </p>
                            <h1 style="
                    text-align: center;
                    margin-top: 45px;
                    margin-bottom: 15px;
                    color: #222;
                  ">
                                Replacement & Refund Request
                            </h1>
                            <p style="
                    width: 95%;
                    max-width: 800px;
                    margin: 0;
                    margin-top: 45px;
                  ">
                                Dear Sir/Madam
                            </p>
                            <p style="
                    width: 95%;
                    max-width: 800px;
                    margin: 0;
                    margin-top: 5px;
                  ">
                                ${text}
                            </p>
                            <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                style="margin-bottom: 20px; padding: 10px">
                                <!-- Customer Details -->
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Requestor
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.initiatorId
                                            ? data?.formId?.initiatorId
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Requestor Employee Code
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.employeeCode
                                            ? data?.formId?.employeeCode
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Requestor Employee Name
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.employeeName
                                            ? data?.formId?.employeeName
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Customer Code
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.customerCode
                                            ? data?.formId?.customerCode
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Customer Name
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.customerName
                                            ? data?.formId?.customerName
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Complain No
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.complainNo
                                            ? data?.formId?.complainNo
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Complain Date
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.complainDate
                                            ? getFormatDate(
                                                data?.formId?.complainDate
                                              )
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Technician Last Visit Date
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.technicianLastVisitDate
                                            ? getFormatDate(
                                                data?.formId
                                                  ?.technicianLastVisitDate
                                              )
                                            : "N/A"
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Customer Purchased/Ordered From
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.purchasedFrom
                                            ? data?.formId?.purchasedFrom
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        SBU
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.sbu
                                            ? data?.formId?.sbu
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <!-- Other Details -->
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Invoice No
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.invoiceNo
                                            ? data?.formId?.invoiceNo
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Invoice Date
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.invoiceDate
                                            ? data?.formId?.invoiceDate
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Installation Date
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.installationDate
                                            ? getFormatDate(
                                                data?.formId?.installationDate
                                              )
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Invoice Value
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.invoiceValue
                                            ? getFormatDate(
                                                data?.formId?.invoiceValue
                                              )
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Category
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.category
                                            ? data?.formId?.category
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                 <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Severeness
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.severeness
                                            ? data?.formId?.severeness
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                 <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Attached Verification Video
                                    </td>

                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        <a href="${
                                          data?.formId?.verificationVideo
                                            ? data?.formId?.verificationVideo
                                            : " #"
                                        }" target="_self" style="color: #007bff; text-decoration: underline">
                                            ${
                                              data?.formId?.verificationVideo
                                                ? "Attached File"
                                                : "N/A"
                                            }
                                        </a>
                                    </td>
                                </tr>
                                
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Attach Valid Invoice Copy
                                    </td>

                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        <a href="${
                                          data?.formId?.invoiceCopy
                                            ? data?.formId?.invoiceCopy
                                            : " #"
                                        }" target="_self" style="color: #007bff; text-decoration: underline">
                                            ${
                                              data?.formId?.invoiceCopy
                                                ? "Attached File"
                                                : "N/A"
                                            }
                                        </a>
                                    </td>
                                </tr>
                                 <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Policy Status
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.policyStatus
                                            ? data?.formId?.policyStatus
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                 <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Replacement Order No
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.replacementOrderNo
                                            ? data?.formId?.replacementOrderNo
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Product Code
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.productCode
                                            ? data?.formId?.productCode
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Product Name
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.productName
                                            ? data?.formId?.productName
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                 <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Product Category
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.productCategory
                                            ? data?.formId?.productCategory
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Product Serial No.
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.productSNO
                                            ? data?.formId?.productSNO
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Product Status
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.productStatus
                                            ? data?.formId?.productStatus
                                            : "N/A"
                                        }
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Input/Output TDS in Unit Found
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.tds
                                            ? data?.formId?.tds
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        BP Name & Code
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.bpNameCode
                                            ? data?.formId?.bpNameCode
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Water Pressure in Unit
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.waterPressure
                                            ? data?.formId?.waterPressure
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Previous Complaint No & Details
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.complainHistory
                                            ? data?.formId?.complainHistory
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Reason for Return/Replacement
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.reason
                                            ? data?.formId?.reason
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Details of Parts Required
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.spareCode
                                            ? data?.formId?.spareCode
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Final Decision
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.decision
                                            ? data?.formId?.decision
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Remark
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.remark
                                            ? data?.formId?.remark
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="
                        padding: 8px 0;
                        font-weight: bold;
                        width: 45%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        Mode of Payment
                                    </td>
                                    <td style="
                        padding: 8px 0;
                        width: 50%;
                        border-bottom: 1px solid #ccc;
                      ">
                                        ${
                                          data?.formId?.modeOfPayment
                                            ? data?.formId?.modeOfPayment
                                            : "N/A"
                                        }
                                    </td>
                                </tr>
                                ${
                                  data?.formId?.beneficiaryHolder
                                    ? `<tr>
                                    <td style="
            padding: 8px 0;
            font-weight: bold;
            width: 45%;
            border-bottom: 1px solid #ccc;
          ">
                                        Beneficiary Holder
                                    </td>
                                    <td style="
            padding: 8px 0;
            width: 50%;
            border-bottom: 1px solid #ccc;
          ">
                                        ${data?.formId?.beneficiaryHolder}
                                    </td>
                                </tr>`
                                    : ""
                                }

                                ${
                                  data?.formId?.bankName
                                    ? `<tr>
                                    <td style="
            padding: 8px 0;
            font-weight: bold;
            width: 45%;
            border-bottom: 1px solid #ccc;
          ">
                                        Bank Name
                                    </td>
                                    <td style="
            padding: 8px 0;
            width: 50%;
            border-bottom: 1px solid #ccc;
          ">
                                        ${data?.formId?.bankName}
                                    </td>
                                </tr>`
                                    : ""
                                }

                                ${
                                  data?.formId?.accountNo
                                    ? `<tr>
                                    <td style="
            padding: 8px 0;
            font-weight: bold;
            width: 45%;
            border-bottom: 1px solid #ccc;
          ">
                                        Account No
                                    </td>
                                    <td style="
            padding: 8px 0;
            width: 50%;
            border-bottom: 1px solid #ccc;
          ">
                                        ${data?.formId?.accountNo}
                                    </td>
                                </tr>`
                                    : ""
                                }

                                ${
                                  data?.formId?.ifscCode
                                    ? `<tr>
                                    <td style="
            padding: 8px 0;
            font-weight: bold;
            width: 45%;
            border-bottom: 1px solid #ccc;
          ">
                                        IFSC Code
                                    </td>
                                    <td style="
            padding: 8px 0;
            width: 50%;
            border-bottom: 1px solid #ccc;
          ">
                                        ${data?.formId?.ifscCode}
                                    </td>
                                </tr>`
                                    : ""
                                }

                                ${
                                  data?.formId?.proofDocument
                                    ? `<tr>
                                    <td style="
            padding: 8px 0;
            font-weight: bold;
            width: 45%;
            border-bottom: 1px solid #ccc;
          ">
                                        Proof Document
                                    </td>
                                    <td style="
            padding: 8px 0;
            width: 50%;
            border-bottom: 1px solid #ccc;
          ">
                                        <a href="${data.formId.proofDocument}" target="_self"
                                            style="color: #007bff; text-decoration: underline">
                                            Attached File
                                        </a>
                                    </td>
                                </tr>`
                                    : ""
                                }

                            </table>
                            <div style="
      border: 1px dashed #ccc;
      margin-top: 30px;
      padding: 15px;
    ">
                                <h2 style="margin-bottom: 15px; color: #222">
                                    Approval History
                                </h2>

                                ${
                                  data.step1.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step1.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step1
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step1
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step1
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step1.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step1
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }

                                ${
                                  data.step2.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step2.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step2
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step2
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step2
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step2.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step2
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }

                                ${
                                  data.step3.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step3.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step3
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step3
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step3
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step3.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step3
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }

                                ${
                                  data.step4.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step4.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step4
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step4
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step4
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step4.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step4
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }

                                ${
                                  data.step5.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step5.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step5
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step5
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step5
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step5.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step5
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }

                                ${
                                  data.step6.length
                                    ? `
                                <table width="100%" cellpadding="0" cellspacing="0" border="0"
                                    style="margin-bottom: 20px">
                                    <tr>
                                        <td
                                            style="padding-bottom: 10px; color: #333; line-height: 1.6; font-size: 14px;">
                                            ${
                                              data.step6.filter(
                                                (step) =>
                                                  step.status === "Pending"
                                              ).length > 0
                                                ? `Pending by ${data.step6
                                                    .filter(
                                                      (step) =>
                                                        step.status ===
                                                        "Pending"
                                                    )
                                                    .map((step) => step.email)
                                                    .join(", ")}`
                                                : ""
                                            }
                                            ${data.step6
                                              .filter(
                                                (step) =>
                                                  step.status === "Approved"
                                              )
                                              .map(
                                                (step) =>
                                                  `Approved by ${step.email}`
                                              )
                                              .join(", ")}
                                            ${data.step6
                                              .filter(
                                                (step) =>
                                                  step.status === "Declined"
                                              )
                                              .map(
                                                (step) =>
                                                  `Declined by ${step.email}`
                                              )
                                              .join(", ")}

                                        </td>
                                    </tr>
                                    ${
                                      data.step6.some((step) => step.comment)
                                        ? `
                                    <tr>
                                        <td
                                            style="padding-left: 15px; border-left: 4px solid #999; color: #555; font-style: italic;">
                                            Comment: ${data.step6
                                              .filter((step) => step.comment)
                                              .map((step) => step.comment)
                                              .join(", ")}
                                        </td>
                                    </tr>
                                    `
                                        : ""
                                    }
                                </table>
                                `
                                    : ""
                                }
                            </div>





                            <!-- Action Buttons -->
                            ${
                              url
                                ? ` <table cellpadding="0" cellspacing="0" border="0" style="
                    margin: auto;
                    padding: 20px 10px;
                    text-align: center;
                    width: 50%;
                  ">
                                <tr>
                                    <td>
                                        <a href="${url}" style="
                          background-color: #003593;
                          border: 1px solid #ddd;
                          color: #ddd;
                          padding: 8px 15px;
                          display: inline-block;
                          text-decoration: none;
                          display: inline-block;
                          min-width: 85px;
                          font-size: 0.85rem;
                        ">
                                            Submit Response
                                        </a>
                                    </td>

                                </tr>
                            </table>`
                                : ""
                            }
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>

</html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error while sending mail=", error);
    } else {
      console.log("Mail sent!");
    }
  });
};

export const sendApprovalRequestEmail = (
  approver,
  formResponse,
  approvalFlow
) => {

  const mailOptions = {
    from: "saurabh.pandey@spacetotech.com",
    to: approver?.userId.toLowerCase(),
    subject: `Approval Request`,
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Approval Request</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 14px;
            background-color: #f3f4f6;
        }
        .btn {
            background-color: #003593;
            border: 1px solid #ddd;
            color: #fff;
            padding: 8px 15px;
            text-decoration: none;
            display: inline-block;
            min-width: 85px;
            font-size: 0.85rem;
        }
        .btn:hover {
            background-color: #002060;
        }
    </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f3f4f6">
        <tr>
            <td align="center">
                <table cellpadding="0" cellspacing="0" border="0" style="
              width: 95%;
              max-width: 800px;
              background: #ffffff;
              border: 1px solid #ddd;
              border-radius: 8px;
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
              padding: 20px;
            ">
                    <tr>
                        <td>
                            <h1 style="text-align: center; color: #222;">
                                Approval Request
                            </h1>
                            <p>Dear ${approver?.userId},</p>
                            <p>You have a new approval request for the following form:</p>
                            <p>Please review the request and provide your approval.</p>
                            <p><a href="${process.env.APPROVAL_URL}/approval?userId=${approver?.userId}&approvalFlowId=${approvalFlow?._id}" class="btn">Submit Response</a></p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error while sending mail=", error);
    } else {
      console.log("Mail sent!");
    }
  });
};
