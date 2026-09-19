const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true, default: 'Security Analyst' },
  email: { type: String, required: true, unique: true },
  password: { 
    type: String, 
    required: function() {
      return this.authProvider === 'local';
    } 
  },
  googleId: { type: String, default: null },
  profileImage: { type: String, default: null },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
  role: { type: String, default: 'analyst' },
  authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
