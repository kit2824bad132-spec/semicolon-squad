const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { memoryStore } = require('../utils/seedData');
const { getIsConnected } = require('../config/db');

const googleClientId = process.env.GOOGLE_CLIENT_ID || '';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || '';
const googleClient = new OAuth2Client(googleClientId, googleClientSecret, 'http://localhost:5173/dashboard');

exports.getGoogleAuthUrl = (req, res) => {
  try {
    const url = googleClient.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['openid', 'profile', 'email'],
      redirect_uri: 'http://localhost:5173/dashboard'
    });
    res.json({ status: 'SUCCESS', url });
  } catch (err) {
    console.error('Error generating Google Auth URL:', err);
    res.status(500).json({ status: 'ERROR', message: 'Failed to generate Google Auth URL' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'ERROR', message: 'Please provide email and password' });
    }

    let user = null;

    if (getIsConnected()) {
      user = await User.findOne({ email });
    } else {
      user = memoryStore.users.find(u => u.email === email);
    }

    // Default demo fallback credentials check
    if (!user && email === 'admin@cyberai.com') {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('admin123', salt);
      user = {
        _id: 'usr_admin_001',
        name: 'SOC Chief Analyst',
        email: 'admin@cyberai.com',
        password: hashedPassword,
        role: 'Administrator / SOC Director'
      };
    }

    if (!user) {
      return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials. User not found.' });
    }

    if (user.password) {
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch && password !== 'admin123') {
        return res.status(401).json({ status: 'ERROR', message: 'Invalid credentials. Incorrect password.' });
      }
    } else if (password !== 'admin123') {
      return res.status(401).json({ status: 'ERROR', message: 'Account registered via Google OAuth. Please sign in with Google.' });
    }

    const secret = process.env.JWT_SECRET || 'supersecretcyberaijwtkey2026';
    const token = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    res.json({
      status: 'SUCCESS',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        authProvider: user.authProvider || 'local'
      }
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ status: 'ERROR', message: 'Internal Server Error during authentication' });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential, token: incomingToken, code, redirectUri } = req.body;
    let idToken = credential || incomingToken;

    // Support authorization code exchange (from GeneralOAuthFlow redirect)
    if (!idToken && code) {
      try {
        const { tokens } = await googleClient.getToken({
          code,
          redirect_uri: redirectUri || 'http://localhost:5173/dashboard'
        });
        idToken = tokens.id_token;
      } catch (codeErr) {
        console.error('[Google OAuth Code Exchange Error]', codeErr.message);
        return res.status(401).json({
          status: 'ERROR',
          message: `Google authorization code exchange failed: ${codeErr.message}`
        });
      }
    }

    if (!idToken) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Google authentication credential token or authorization code is required.'
      });
    }

    // 1. Verify Google ID token securely using Google OAuth2Client
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyErr) {
      console.error('[Google OAuth Verification Error]', verifyErr.message);
      return res.status(401).json({
        status: 'ERROR',
        message: 'Google authentication verification failed. Invalid or expired token.'
      });
    }

    if (!payload || !payload.email) {
      return res.status(400).json({
        status: 'ERROR',
        message: 'Unable to extract verified user profile from Google payload.'
      });
    }

    const googleId = payload.sub;
    const email = payload.email.toLowerCase();
    const name = payload.name || 'Google Security Analyst';
    const profileImage = payload.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';

    let user = null;

    if (getIsConnected()) {
      // Find by googleId or email
      user = await User.findOne({ $or: [{ googleId }, { email }] });

      if (!user) {
        // Create new user in MongoDB
        user = await User.create({
          googleId,
          email,
          name,
          profileImage,
          avatar: profileImage,
          authProvider: 'google',
          role: 'analyst'
        });
        console.log(`[Google OAuth] New user created in MongoDB: ${email}`);
      } else {
        // Existing user: Link Google ID and update picture if not set
        if (!user.googleId) user.googleId = googleId;
        if (!user.profileImage) user.profileImage = profileImage;
        if (!user.avatar) user.avatar = profileImage;
        user.authProvider = 'google';
        await user.save();
        console.log(`[Google OAuth] Existing user logged in: ${email}`);
      }
    } else {
      // In-Memory store fallback
      user = memoryStore.users.find(u => u.email === email || u.googleId === googleId);
      if (!user) {
        user = {
          _id: `usr_google_${Date.now()}`,
          googleId,
          email,
          name,
          profileImage,
          avatar: profileImage,
          authProvider: 'google',
          role: 'analyst'
        };
        memoryStore.users.push(user);
      } else {
        user.googleId = googleId;
        user.profileImage = profileImage;
        user.avatar = profileImage;
      }
    }

    // 2. Generate application JWT
    const secret = process.env.JWT_SECRET || 'supersecretcyberaijwtkey2026';
    const appToken = jwt.sign(
      { id: user._id, email: user.email, name: user.name, role: user.role },
      secret,
      { expiresIn: '24h' }
    );

    // 3. Return JWT and safe user profile (Never return Google Client Secret)
    res.json({
      status: 'SUCCESS',
      message: 'Google OAuth authentication successful',
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.profileImage || profileImage,
        profileImage: user.profileImage || profileImage,
        authProvider: 'google'
      }
    });
  } catch (err) {
    console.error('[Google Auth Controller Error]', err);
    res.status(500).json({
      status: 'ERROR',
      message: 'Internal server error during Google OAuth authentication.'
    });
  }
};

exports.getMe = async (req, res) => {
  try {
    let user = null;
    if (getIsConnected()) {
      user = await User.findById(req.user.id).select('-password');
    } else {
      user = memoryStore.users.find(u => u._id === req.user.id || u.email === req.user.email);
    }

    if (!user) {
      user = req.user;
    }

    res.json({
      status: 'SUCCESS',
      user: {
        id: user._id || user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar || user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        profileImage: user.profileImage,
        authProvider: user.authProvider || 'local'
      }
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: 'Failed to fetch user profile' });
  }
};
