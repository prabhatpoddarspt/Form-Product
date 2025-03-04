import mongoose from 'mongoose';

const universalApprovalFlowSchema = new mongoose.Schema(
  {
    formResponseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversalFormResponse',
      required: true,
    },
    approvers: [
      {
        userId: {
          type: String,
          required: true,
        },
        status: {
          type: String,
          enum: ['pending', 'approved', 'rejected'],
          default: 'pending',
        },
        comments: {
          type: String,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    currentApproverIndex: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

const UniversalApprovalFlow = mongoose.model('UniversalApprovalFlow', universalApprovalFlowSchema);

export default UniversalApprovalFlow;