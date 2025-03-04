import mongoose from "mongoose";

const childNodeSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  category: { type: String, required: true },
  children: [{ type: mongoose.Schema.Types.Mixed }],
  expanded: { type: Boolean, default: false },
  value: [{ type: String, default: "" }],
  approvalStep: { type: Number, default: 1 }, 
});

const UniversalHierarchySchema = new mongoose.Schema(
  {
    id: { type: Number, required: true },
    category: { type: String, required: true },
    children: [childNodeSchema],
    expanded: { type: Boolean, default: false },
    value: [{ type: String, default: "" }],
    approvalStep: { type: Number, default: 1 }, 
  },
  {
    timestamps: true,
  }
);

const UniversalHierarchy = mongoose.model(
  "UniversalHierarchy",
  UniversalHierarchySchema
);

export default UniversalHierarchy;
