import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

// Define the schema for Tags (which can be inputs, checkboxes, selects, etc.)
const tagSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['input', 'checkbox', 'select', 'dropdown', 'fileUpload','radio','time','date'],
      required: true,
    },
    options: {
      type: [String],  // For checkboxes, selects, dropdown options
      default: [],
    },
    required: {
      type: Boolean,
      default: false,  // Make this field optional, but you can set it to true if needed
    },
    validation: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {
        type: 'none', // 'none', 'number', 'text', 'regex','file'
        errorMessage: '',
        validationLogic: {
          rule: '', // 'greaterThan', 'lessThan', 'equal', 'range'
          value: null,
          minValue: null, // for range
          maxValue: null, // for range
          pattern: '',
          allowedFileTypes: {
            type: [String], // Allowed file types, e.g., ['image/jpeg', 'video/mp4']
            default: [],
          },
          maxSize: {
            type: Number,  // Maximum file size in bytes (e.g., 5MB = 5 * 1024 * 1024)
            default: 0,
          },
        },
   
      },
    },
  },
  { _id: false } // To prevent auto generation of a separate _id for each tag
);




// Define the schema for Sections
const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tags: {
      type: [tagSchema], // Array of tags
      default: [],
    },
  },
  { _id: false } // To prevent auto generation of a separate _id for each section
);

// Define the schema for the Form
const formSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },

    properties: {
      bgColor: {
        type: String,
      },
      font: {
        type: String,
      },
      color: {
        type: String,
      }
    },


    sections: {
      type: [sectionSchema], // Array of sections
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Add mongoose-delete plugin for soft delete functionality
formSchema.plugin(mongoose_delete, {
  overrideMethods: ['find', 'findOne', 'findOneAndUpdate', 'update'],
});

const UniversalForm = mongoose.model('UniversalForm', formSchema);

export default UniversalForm;
