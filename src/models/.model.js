import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const masterSchema = new mongoose.Schema(
  {
    region: {
      type: String,
      index: true,
    },
    category: {
      type: String,
      index: true,
    },
    key: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: String,
      required: true,
    },
  
  },
  {
    timestamps: true,
  }
);

masterSchema.plugin(mongoose_delete, {
  overrideMethods: ['find', 'findOne', 'findOneAndUpdate', 'update'],
});

const Master = mongoose.model('masterData', masterSchema);

export default Master;
