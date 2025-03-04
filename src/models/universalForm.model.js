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
      of: mongoose.Schema.Types.Mixed, // Allow different types (Boolean, String, Number)
      default: {
        uppercase: false,    // Should allow uppercase letters (Boolean)
        lowercase: false,    // Should allow lowercase letters (Boolean)
        alphanumeric: false, // Should only allow alphanumeric characters (Boolean)
        minLength: 0,        // Minimum length for the input field (Number)
        maxLength: 255,      // Maximum length for the input field (Number)
        email: false,        // Should validate email format (Boolean)
        number: false,       // Should validate a number format (Boolean)
        url: false,          // Should validate a URL format (Boolean)
        regex: '',           // Custom regex pattern for advanced validation (String)
        whitespace: false,   // Should not allow leading or trailing spaces (Boolean)
      },
    },
    fileUploadValidation: {
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
  { _id: false } // To prevent auto generation of a separate _id for each tag
);

// Custom validation logic for input type tags
tagSchema.path('title').validate(function (value) {
  // Check if type is 'input' and perform validation
  if (this.type === 'input') {
    const { uppercase, lowercase, alphanumeric, minLength, maxLength, email, number, url, regex, whitespace } = this.validation;

    if (uppercase && !/[A-Z]/.test(value)) {
      return false; // Fail if value doesn't contain uppercase
    }
    if (lowercase && !/[a-z]/.test(value)) {
      return false; // Fail if value doesn't contain lowercase
    }
    if (alphanumeric && !/^[a-zA-Z0-9]*$/.test(value)) {
      return false; // Fail if value is not alphanumeric
    }
    if (value.length < minLength) {
      return false; // Fail if the length is less than minLength
    }
    if (value.length > maxLength) {
      return false; // Fail if the length exceeds maxLength
    }
    if (email && !/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(value)) {
      return false; // Fail if value is not a valid email
    }
    if (number && isNaN(value)) {
      return false; // Fail if value is not a valid number
    }
    if (url && !/^https?:\/\/[^\s$.?#].[^\s]*$/.test(value)) {
      return false; // Fail if value is not a valid URL
    }
    if (regex && !new RegExp(regex).test(value)) {
      return false; // Fail if value does not match the custom regex
    }
    if (whitespace && /^\s|\s$/.test(value)) {
      return false; // Fail if value has leading or trailing spaces
    }
  }

  return true; // If all conditions are satisfied
}, 'Validation failed for tag title.');



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
