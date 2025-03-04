import mongoose from "mongoose";
import mongoose_delete from "mongoose-delete";

const otherSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Declined", "More Info", "Parallel Approved"],
      default: "Pending",
    },
    comment: {
      type: String,
      default: ""
    },
    created: {
      type: Date,
      default: () => new Date(),
    },

    createdAt: {
      type: Date,
      default: () => new Date(),
    },
    updatedAt: {
      type: Date,
      default: () => new Date(),
    },
  },
  {
    _id: false,
  }
);

const requestSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Form",
      required: true,
      index: true,
    },
    region: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    severeness: {
      type: String,
      default: null,
    },
    slNo: {
      type: Number,
      required: true,
      index: true
    },
    totalRecipients: {
      type: Number,
    },
    sbu: {
      type: String,
    },
    pendingPosition: {
      type: [String],
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Declined", "More Info"],
      default: "Pending",
    },
    currentStep: {
      type: Number,
      default: 1,
    },
    currentToken: {
      type: String,
    },
    assignedEmail: {
      type: [],
    },
    step1: {
      type: [otherSchema],
    },
    step2: {
      type: [otherSchema],
    },
    step3: {
      type: [otherSchema],
    },
    step4: {
      type: [otherSchema],
    },
    step5: {
      type: [otherSchema],
    },
    step6: {
      type: [otherSchema],
    },
    step7: {
      type: [otherSchema],
    },
  },
  {
    timestamps: true,
  }
);

requestSchema.plugin(mongoose_delete, {
  overrideMethods: ["find", "findOne", "findOneAndUpdate", "update"],
});

const Request = mongoose.model("Request", requestSchema);

export default Request;
