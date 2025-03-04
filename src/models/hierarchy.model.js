// import mongoose from 'mongoose';

// const stepSchema = new mongoose.Schema({
//   accept: {
//     type: [],
//     default: null
//   },
//   decline: {
//     type: [],
//     default: null
//   },
//   moreInfo: {
//     type: [],
//     default: null 
//   }
// });

// // Schema for the Hierarchy model
// const hierarchySchema = new mongoose.Schema(
//   {
//     // formId: {
//     //   type: mongoose.Schema.Types.ObjectId,
//     //   ref: 'Form',
//     //   required: true
//     // },
//     filters: {
//       type: [String], // Array of strings
//       required: true
//     },
//     steps: {
//       type: [stepSchema], 
//       required: true
//     }
//   },
//   {
//     timestamps: true,
//   }
// );

// const Hierarchy = mongoose.model('Hierarchy', hierarchySchema);

// export default Hierarchy;


import mongoose from 'mongoose';

const conditionSchema = new mongoose.Schema({
  field: {
    type: String,
    required: true
  },
  operator: {
    type: String,
    required: true
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  }
});

const emailConditionSchema = new mongoose.Schema({
  conditions: {
    type: [conditionSchema],
    default: []
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  _id: false

});

const stepSchema = new mongoose.Schema({
  position: {
    type: String,
    required: true,
    // enum:["CommercialA","Area Head","ZSH","RM","CommercialB","SCM"]

  },
  accept: {
    type: [emailConditionSchema],
    default: []
  },
  decline: {
    type: [emailConditionSchema],
    default: []
  },
  moreInfo: {
    type: [emailConditionSchema],
    default: []
  },
  _id: false
});

const hierarchySchema = new mongoose.Schema(
  {
    conditions: {
      type: [conditionSchema],
      default: []
    },
    filters: {
      type: [String],
      required: true
    },
    steps: {
      type: [stepSchema],
      required: true
    }
  },
  {
    timestamps: true,
  }
);

const Hierarchy = mongoose.model('Hierarchy', hierarchySchema);

export default Hierarchy;
