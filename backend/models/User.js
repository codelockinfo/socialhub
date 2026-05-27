import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const OAuthTokenSchema = new mongoose.Schema({
  accessToken: { type: String, required: true },
  refreshToken: { type: String },
  expiresAt: { type: Date },
  profileId: { type: String },
  username: { type: String },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  avatar: { type: String },
  
  // Embedded OAuth Tokens
  socialAccounts: {
    meta: {
      type: OAuthTokenSchema,
      default: null
    },
    youtube: {
      type: OAuthTokenSchema,
      default: null
    },
    linkedin: {
      type: OAuthTokenSchema,
      default: null
    }
  }
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', UserSchema);

export default User;
