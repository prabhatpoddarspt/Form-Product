import mongoose, {Schema} from "mongoose";
import mongoose_delete from 'mongoose-delete';
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema(
    {
        email: {
          type: String,
          required: [true, "Please enter an email"],
          index: true,
        },
        otp: {
          type: Number,
          required: true
        },
        otpExpiry: {
          type: Date,
          required: true,
          default: function() {
            // OTP expires in 10 minutes
            return new Date(Date.now() + 10 * 60 * 1000);
          }
        }
 
    
      
      },
      {
        timestamps: true,
      }
);

userSchema.plugin(mongoose_delete, {
    overrideMethods: ['find', 'findOne', 'findOneAndUpdate', 'update'],
});

userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next()
})

userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id,

        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

// Add method to verify if OTP is expired
userSchema.methods.isOTPExpired = function () {
    return Date.now() > this.otpExpiry;
}

// Add method to verify OTP
userSchema.methods.verifyOTP = function (otp) {
    return this.otp === otp && !this.isOTPExpired();
}

const OTP = mongoose.model('OTP', userSchema);

export default OTP;
