// const mongoose = require('mongoose');

// const userSchema = new mongoose.Schema({
//   firstName: { type: String, required: true },
//   middleName: { type: String },
//   lastName: { type: String, required: true },
  
//   email: { type: String, required: true, unique: true },
//   password: { type: String }, // Only required if registered manually 
//   // // Only for Google sign-in
//   firebaseUid: { 
//     type: String, 
//     unique: true,
//     sparse: true 
//   },
//   role: { 
//     type: String, 
//     enum: ['student', 'student_head', 'admin'], 
//     default: 'student' 
//   },
  
//   rollNo: { 
//     type: String, 
//     required: function() {
//       return this.role === 'student' || this.role === 'student_head';
//     } 
//   },

//   college: { type: String, required: true },
//   department: { type: String, required: true },

//   isVerified: { type: Boolean, default: false },
  
// }, { timestamps: true });

// module.exports = mongoose.model('User', userSchema);


const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String },
  lastName: { type: String, required: true },

  email: { type: String, required: true, unique: true },
  password: { type: String, select: false },  // select: false hides it from queries

  firebaseUid: { 
    type: String, 
    unique: true,
    sparse: true 
  },

  role: { 
    type: String, 
    enum: ['student', 'student_head', 'admin'], 
    default: 'student' 
  },

  rollNo: { 
    type: String, 
    required: function() {
      return this.role === 'student' || this.role === 'student_head';
    } 
  },
phoneNumber: {
  type: String,
  validate: {
    validator: function (v) {
      // Allow empty/null values or valid 10-digit numbers
      return !v || /^\d{10}$/.test(v);
    },
    message: props => `${props.value} is not a valid 10-digit phone number!`
  }
},

  college: { type: String },
  department: { type: String },

  certificates: [{
    title: { type: String, required: true },
    description: { type: String },
    filePath: { type: String, required: true },
    originalName: { type: String, required: true },
    mimeType: { type: String, required: true },
    size: { type: Number, required: true },
    uploadDate: { type: Date, default: Date.now }
  }],

  isVerified: { type: Boolean, default: false },

}, { timestamps: true });

// 🔒 Pre-save hook to hash password
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ✅ Instance method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
