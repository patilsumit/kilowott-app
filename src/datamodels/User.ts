import * as mongoose from 'mongoose';
const Schema = mongoose.Schema;

const userSchema = new Schema({
  firstName: { type: String, required: false },
  lastName: { type: String, required: false },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: false },
  address : [{
    addressType: { type: String },
    street: { type: String, required: false },
    city: { type: String, required: false },
    state: { type: String, required: false },
    pincode: { type: Number, required: false },
  }],
  roleName: {
    type: String,
    enum: ['SuperAdmin','Admin','User'],
    default: 'Admin',
  },
  profilePic: { type: String, required: false },
  status: {
    type: String,
    enum: ['Enable','Disabled'],
    default: 'Enable',
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
const User = mongoose.model('users', userSchema, 'users');
export default User;