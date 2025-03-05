import { asyncHandler } from "../util/asyncHandler.js";
import { ApiResponse } from "../util/ApiResponse.js";
import UniversalForm from "../models/universalForm.model.js"; // Import the UniversalForm model
import UniversalFormResponse from "../models/universalFormResponse.model.js";
import UniversalHierarchy from "../models/universalHierarchy.model.js";
import UniversalApprovalFlow from "../models/universalApprovalFlow.model.js";
// import { sendApprovalRequestEmail } from "../helper/mailer.js";

// Create a new form (POST)
const createForm = asyncHandler(async (req, res) => {
  const formData = req.body; // Get form data from the request body
  // const newForm = new UniversalForm({...formData,userId:req.user._id});
  const newForm = new UniversalForm(formData);
  await newForm.save(); // Save the new form to the database
  return res
    .status(201)
    .json(new ApiResponse(201, newForm, "Form created successfully"));
});

// Get all forms (GET)
const getForms = asyncHandler(async (req, res) => {
  const { userId, title } = req.query;
  const filter = {};

  if (userId) {
    filter.userId = userId; // Filter forms by user ID
  }

  if (title) {
    filter.title = new RegExp(title, "i"); // Filter forms by title (case-insensitive)
  }

  const forms = await UniversalForm.find(filter).select(
    "title description bgColor font createdAt"
  );
  return res
    .status(200)
    .json(new ApiResponse(200, forms, "Forms fetched successfully"));
});

// Get a single form by ID (GET)
const getFormById = asyncHandler(async (req, res) => {
  const { id } = req.query; // Get form ID from the request parameters
  const form = await UniversalForm.findById(id);

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Form fetched successfully"));
});

// Update a form by ID (PUT)
const updateForm = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get form ID from the request parameters
  const updateData = req.body; // Get the updated form data from the request body

  const form = await UniversalForm.findByIdAndUpdate(id, updateData, {
    new: true,
  });

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Form updated successfully"));
});

// Delete a form by ID (DELETE)
const deleteForm = asyncHandler(async (req, res) => {
  const { id } = req.params; // Get form ID from the request parameters
  const form = await UniversalForm.findByIdAndDelete(id);

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Form deleted successfully"));
});

// Soft delete a form by ID (DELETE - Soft Delete)
const softDeleteForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const form = await UniversalForm.delete({ _id: id });

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Form marked for deletion successfully"));
});

// Restore a soft-deleted form (PUT)
const restoreForm = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const form = await UniversalForm.restore({ _id: id });

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  return res
    .status(200)
    .json(new ApiResponse(200, form, "Form restored successfully"));
});

const getFormField = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const form = await UniversalForm.findById(id);
  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  const tagTitles = form.sections.flatMap((section) =>
    section.tags.map((tag) => tag.title)
  );

  return res
    .status(200)
    .json(new ApiResponse(200, tagTitles, "Form title retrieved successfully"));
});

const getFieldOptions = asyncHandler(async (req, res) => {
  const { id, field } = req.query;
  const form = await UniversalForm.findById(id, "sections.tags");

  if (!form) {
    return res.status(404).json(new ApiResponse(404, null, "Form not found"));
  }

  const options = form.sections.flatMap((section) =>
    section.tags
      .filter((tag) => tag.title === field)
      .flatMap((tag) => tag.options)
  );

  if (options.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, [], "No options found for this field"));
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        options,
        `Options for field '${field}' retrieved successfully`
      )
    );
});

// const createFormResponse = asyncHandler(async (req, res) => {
//   const { formId, userId, sectionResponses } = req.body;

//   const formResponse = new UniversalFormResponse({
//     formId,
//     userId,
//     sectionResponses,
//   });

//   await formResponse.save();

//   return res
//     .status(201)
//     .json(new ApiResponse(201, formResponse, `form submitted successfully`));
// });

// Helper function to evaluate conditions
const evaluateCondition = (tag, condition) => {
  console.log("tag 🚀🚀🚀", tag);
  console.log("condition 🚀🚀🚀", condition);

  // Properly parse the condition into key, operator, and value
  const match = condition.match(/^(.+?)\s*([=<>])\s*(.+)$/);
  if (!match) return false;

  const [, key, operator, value] = match;

  // Ensure we're comparing the correct property (tagTitle instead of title)
  if (tag.tagTitle.trim().toLowerCase() !== key.trim().toLowerCase())
    return false;

  const tagValue = tag.response.toString().trim();
  const conditionValue = value.trim();

  switch (operator) {
    case "=":
      return tagValue.toLowerCase() === conditionValue.toLowerCase(); // Case-insensitive comparison
    case ">":
      return parseFloat(tagValue) > parseFloat(conditionValue);
    case "<":
      return parseFloat(tagValue) < parseFloat(conditionValue);
    default:
      return false;
  }
};

// Helper function to get approvers from hierarchy based on form response data
const getApproversFromHierarchy = async (hierarchyId, formResponseData) => {
  console.log("Fetching hierarchy...");
  const hierarchy = await UniversalHierarchy.findById(hierarchyId).populate(
    "children"
  );

  const approvers = [];

  const traverseHierarchy = (node, step = 1) => {
    if (!node) return;

    console.log(`Processing node (Step ${step}):`, node.category);

    // Collect approvers from the current node
    if (Array.isArray(node.value) && node.value.length > 0) {
      node.value.forEach((email) => {
        approvers.push({ userId: email, step: node.approvalStep || step });
      });
    }

    // Traverse child nodes if they exist
    if (node.children && node.children.length > 0) {
      node.children.forEach((child) => {
        console.log("Evaluating condition for child:", child.category);

        // Check if any tag response satisfies the child condition
        const matches = formResponseData.some((response) =>
          response.tagResponses.some((tag) =>
            evaluateCondition(tag, child.category)
          )
        );

        if (matches) {
          console.log(
            "Condition matched ✅, traversing child:",
            child.category
          );
          traverseHierarchy(child, step + 1);
        } else {
          console.log("Condition did not match ❌ for:", child.category);
        }
      });
    }
  };

  traverseHierarchy(hierarchy);
  return approvers;
};

// Create a new form response and approval flow
const createFormResponse = async (req, res) => {
  try {
    const { formId, userId, sectionResponses } = req.body;

    const hierarchyId = "67c1bf572b055ef6a65106ca";

    // Create the form response
    const formResponse = new UniversalFormResponse({
      formId,
      userId,
      sectionResponses,
    });

    await formResponse.save();

    // Get approvers from hierarchy based on form response data and create approval flow
    const approvers = await getApproversFromHierarchy(
      hierarchyId,
      sectionResponses
    );

    const approvalFlow = new UniversalApprovalFlow({
      formResponseId: formResponse._id,
      approvers,
    });

    await approvalFlow.save();

    if (approvers.length > 0) {
      sendApprovalRequestEmail(approvers[0], formResponse,approvalFlow);
    }

    res.status(201).json({ formResponse, approvalFlow });
  } catch (error) {
    console.error("Error creating form response:", error);
    res.status(500).json({ error: error.message });
  }
};

export {
  createForm,
  getForms,
  getFormById,
  updateForm,
  deleteForm,
  softDeleteForm,
  restoreForm,
  getFormField,
  getFieldOptions,
  createFormResponse,
};
