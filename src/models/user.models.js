import mongoose,{Schema} from "mongoose";
import bcrypt  from "bcrypt"
import jwt from "jsonwebtoken"
const userSchema = new Schema({

  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true
  },
  avatar: {
    type: String, //cloudinary URL
    required: true
  },
  coverImage: {
    type:String
  },
  watchHistory: [
    {
      type: Schema.Types.ObjectId,
      ref: "Video"
    }
  ],
  password: {
    type: String,
    require: [true,"password is required"]
  },
  refreshToken: {
    type: String
  }
},
 {timestamps: true}
)



userSchema.pre("save", async function (next) {
  
if (!this.modified("password")) return next

  this.password = bcrypt.hash(this.password, 10)
  next()
})

userSchema.methods.isPasswordCorrect = async function 
(password){
  return  bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
  // short lived access token
  return jwt.sign({
    _id:this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname
  }, process.env.ACCESS_TOKEN_SECRET,
  { expiresIn : process.env.ACCESS_TOKEN_EXPIRY}  
);
}
userSchema.methods.generateRefreshToken = function (){
  // jwt import hooa hai yeh package web token bnanay ke liye use hoota hai
  return jwt.sign({
    _id:this._id,
    email: this.email,
    username: this.username,
    fullname: this.fullname
  }, process.env.REFRESH_TOKEN_SECRET,
  { expiresIn : process.env.REFRESH_TOKEN_EXPIRY}  
);
}

export const User = mongoose.model("User",userSchema)


// mongoose act as field validator in between
// created at and updated at covered by timestamps