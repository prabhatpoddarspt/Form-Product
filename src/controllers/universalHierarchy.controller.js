import { sendApprovalRequestEmail } from "../helper/mailer.js";
import UniversalApprovalFlow from "../models/universalApprovalFlow.model.js";
import UniversalFormResponse from "../models/universalFormResponse.model.js";

// Approve or reject a form response
const updateApprovalStatus = async (req, res) => {
  try {
    const { approvalFlowId, userId, status, comments } = req.body;

    const approvalFlow = await UniversalApprovalFlow.findById(approvalFlowId);
    if (!approvalFlow) {
      return res.status(404).json({ error: "Approval flow not found" });
    }
    const formResponse = await UniversalFormResponse.findById(approvalFlow?.formResponseId)

    // Validate current approver index
    if (
      approvalFlow.currentApproverIndex < 0 ||
      approvalFlow.currentApproverIndex >= approvalFlow.approvers.length
    ) {
      return res.status(400).json({ error: "Invalid approver index" });
    }

    const currentApprover =
      approvalFlow.approvers[approvalFlow.currentApproverIndex];

    // Ensure only the current approver can approve/reject
    if (!currentApprover || currentApprover.userId.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to approve/reject" });
    }

    // Prevent re-approval/rejection
    if (currentApprover.status !== "pending") {
      return res.status(400).json({ error: "This approval has already been processed" });
    }

    // Update the approval status
    currentApprover.status = status;
    currentApprover.comments = comments;
    currentApprover.timestamp = new Date();

    if (status === "approved") {
      approvalFlow.currentApproverIndex += 1;

      // If all approvers have approved, mark the flow as approved
      if (approvalFlow.currentApproverIndex >= approvalFlow.approvers.length) {
        approvalFlow.status = "approved";
      } else {
        // Move to the next approver in the current step
        const nextApprover = approvalFlow.approvers[approvalFlow.currentApproverIndex];
        if (nextApprover.step !== currentApprover.step) {
          approvalFlow.status = `pending_step_${nextApprover.step}`;
        }
        sendApprovalRequestEmail(nextApprover,formResponse,approvalFlow);
      }
    } else if (status === "rejected") {
      approvalFlow.status = "rejected"; // Reject immediately
    }

    await approvalFlow.save();

    res.status(200).json({ message: "Approval status updated", approvalFlow });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export { updateApprovalStatus };
