import mongoose from 'mongoose';
import mongoose_delete from 'mongoose-delete';

const notificationSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    status: {
      type: Boolean,
      default: false, // false = unread, true = read
    },
    reason: {
      type: String,
      enum: ['New Request'], // Possible notification types
      default: 'New Request',
    },

  },
  {
    timestamps: true,
  }
);

// Soft delete support (you can delete notifications without physically removing them from the DB)
notificationSchema.plugin(mongoose_delete, {
  overrideMethods: ['find', 'findOne', 'findOneAndUpdate', 'update'],
});

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
