import mongoose from 'mongoose';

const tagResponseSchema = new mongoose.Schema(
  {
    tagTitle: {
      type: String,
      required: true,
    },
    response: {
      type: mongoose.Schema.Types.Mixed, 
      required: true,
    },
  },
  { _id: false } 
);

// Define the schema for Section Responses
const sectionResponseSchema = new mongoose.Schema(
  {
    sectionTitle: {
      type: String,
      required: true,
    },
    tagResponses: {
      type: [tagResponseSchema],
      default: [],
    },
  },
  { _id: false } 
);

// Define the schema for the Form Response
const formResponseSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UniversalForm',
      required: true,
    },
    // userId: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'User',
    //   required: true,
    // },
    sectionResponses: {
      type: [sectionResponseSchema], 
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const UniversalFormResponse = mongoose.model('UniversalFormResponse', formResponseSchema);

export default UniversalFormResponse;

