const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Helper to handle OAuth login/signup
const handleOAuthUser = async (provider, profile, done) => {
  try {
    const email = profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null;
    const providerIdField = provider === 'google' ? 'googleId' : 'githubId';
    
    if (!email) {
      return done(new Error(`No email found from ${provider} account.`), false);
    }

    // Attempt to find by OAuth ID first
    let user = await User.findOne({ [providerIdField]: profile.id });

    if (!user) {
      // Find by email to link accounts
      user = await User.findOne({ email });
      if (user) {
        user[providerIdField] = profile.id;
        if (user.authProvider === 'local') {
           user.authProvider = provider;
        }
        await user.save();
      } else {
        // Create new user
        // Google profiles don't have a .username field (GitHub does).
        // Build a unique username from displayName or fall back to provider_id.
        const baseUsername = (profile.username || (profile.displayName || '').replace(/\s+/g, '').toLowerCase() || `${provider}_${profile.id}`);
        const username = `${baseUsername}_${profile.id.slice(-4)}`;

        user = await User.create({
          username,
          email: email,
          displayName: profile.displayName || profile.username || `${provider} User`,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
          authProvider: provider,
          [providerIdField]: profile.id,
        });
      }
    }

    return done(null, user);
  } catch (error) {
    return done(error, false);
  }
};

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/google/callback`,
    },
    (accessToken, refreshToken, profile, done) => {
      handleOAuthUser('google', profile, done);
    }
  )
);

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID || 'dummy_id',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || 'dummy_secret',
      callbackURL: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/github/callback`,
      scope: ['user:email'],
    },
    (accessToken, refreshToken, profile, done) => {
      handleOAuthUser('github', profile, done);
    }
  )
);

module.exports = passport;
