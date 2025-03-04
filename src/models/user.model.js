import mongoose, {Schema} from "mongoose";
import mongoose_delete from 'mongoose-delete';
import bcrypt from "bcrypt"

const userSchema = new Schema(
    {
        employeeId: {
            type: String,
            default: '',
        },
        name: {
            type: String,
            default: '',
        },
        email: {
            type: String,
            required: true,
            index: true,
        },
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        profilePic: {
            type: String,
            default: '',
        },
        designation: {
            type: String,
            default: '',
        },
        department: {
            type: String,
            default: '',
        },
        refreshToken: {
            type: String
        },
        status: {
            type: String,
            enum: ['ACTIVE', 'INACTIVE'],
            default: 'ACTIVE',
        },
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
const User = mongoose.model('User', userSchema);

export default User;
