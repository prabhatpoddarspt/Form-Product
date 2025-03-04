import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';
// Create a counter schema to keep track of the running number
const CounterSchema = new mongoose.Schema({
  count: {
    type: Number,
    default: 0,
  },
});

// Model for the counter
const Counter = mongoose.model('Counter', CounterSchema);

const formSchema = new mongoose.Schema(
  {
    slNo: {
      type: Number
    },
    initiatorId: {
      type: String,
      default: null,
    },
    complainNo: {
      type: String,
      default: null,
    },
    complainDate: {
      type: Date,
      default: null,
    },
    customerCode: {
      type: String,
      default: null,
    },
    employeeCode: {
      type: String,
      default: null,
    },
    employeeName: {
      type: String,
      default: null,
    },
    customerName: {
      type: String,
      default: null,
    },
    purchasedFrom: {
      type: String,
      default: null,
    },
    region: {
      type: String,
      default: null,
    },
    sbu: {
      type: String,
      default: null,
    },
    invoiceNo: {
      type: String,
      default: null,
    },
    invoiceDate: {
      type: Date,
      default: null,
    },
    technicianLastVisitDate: {
      type: Date,
      default: null,
    },
    invoiceValue: {
      type: String,
      default: null,
    },
    category: {
      type: String,
      default: null,
    },
    severeness: {
      type: String,
      default: null,
    },
    policyStatus : {
      type: String,
      default: null,
    },
    replacementOrderNo : {
      type: String,
      default: null,
    },
    verificationVideo: {
      type: String,
      default: null,
    },
    invoiceCopy: {
      type: String,
      default: null,
    },
    productCode: {
      type: String,
      default: null,
    },
    productName: {
      type: String,
      default: null,
    },
    productCategory: {
      type: String,
      default: null,
    },
    productSNO: {
      type: String,
      default: null,
    },
    productStatus: {
      type: String,
      default: null,
    },
    installationDate: {
      type: Date,
      default: null,
    },
    tds: {
      type: String,
      default: null,
    },
    bpNameCode: {
      type: String,
      default: null,
    },
    waterPressure: {
      type: String,
      default: null,
    },
    complainHistory: {
      type: String,
      default: null,
    },
    reason: {
      type: String,
      default: null,
    },
    eflRefund: {//Initiator reason for refund (EFL)
      type: String,
      default: null,
    },
    decision: {
      type: String,
      default: null,
    },
    remark: {
      type: String,
      default: null,
    },
    spareCode: {
      type: String,
      default: null,
    },
    modeOfPayment: {
      type: String,
      default: null,
    },
    beneficiaryHolder: {
      type: String,
      default: null,
    },
    bankName: {
      type: String,
      default: null,
    },
    accountNo: {
      type: String,
      default: null,
    },
    ifscCode: {
      type: String,
      default: null,
    },
    proofDocument: {
      type: String,
      default: null,
    },
    reqOrderNo: {
      type: String,
      default: null,
    },
    refundRemark: {
      type: String,
      default: null,
    },
    rfmClearances: {
      type: String,
      default: null,
    },
    refundSap: {
      type: String,
      default: null,
    },
    utrNo: {
      type: String,
      default: null,
    },
    refundDate: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Declined", "More Info"],
      default: "Pending"
    },
  },
  {
    timestamps: true,
  }
);

formSchema.plugin(mongoose_delete, {
  overrideMethods: ['find', 'findOne', 'findOneAndUpdate', 'update'],
});

// Pre-save hook to generate slNo in a running sequence
formSchema.pre("save", async function (next) {
  if (!this.slNo) {
    let counter = await Counter.findOne();

    if (!counter) {
      counter = new Counter({ count: 1 });
    } else {
      counter.count += 1;
    }

    // Save the counter
    await counter.save();

    this.slNo = counter.count;
  }
  next();
});

const Form = mongoose.model('Form', formSchema);

export default Form;
