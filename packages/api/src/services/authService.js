import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';

export const authService = {
  async register({ email, password, name }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error('Email already registered');
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      email,
      passwordHash,
      name,
    });

    const tokens = await this.generateTokens(user._id);
    return { user, ...tokens };
  },

  async login({ email, password }) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const tokens = await this.generateTokens(user._id);
    return { user, ...tokens };
  },

  async refreshToken(refreshToken) {
    const tokenDoc = await RefreshToken.findOne({ token: refreshToken });
    if (!tokenDoc || tokenDoc.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const user = await User.findById(tokenDoc.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await RefreshToken.deleteOne({ _id: tokenDoc._id });
    const tokens = await this.generateTokens(user._id);
    return { user, ...tokens };
  },

  async logout(refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  },

  async generateTokens(userId) {
    const accessToken = jwt.sign({ userId }, config.jwt.accessSecret, {
      expiresIn: config.jwt.accessExpiry,
    });

    const refreshToken = jwt.sign({ userId }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiry,
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await RefreshToken.create({
      userId,
      token: refreshToken,
      expiresAt,
    });

    return { accessToken, refreshToken };
  },
};
