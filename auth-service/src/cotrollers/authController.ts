import type { Request, Response } from 'express';
import { prismaService } from '../services/prismaService.js';
import { jwtService, type JwtPayload } from '../services/jwtService.js';
import { redisClient } from '../config/redisClient.js';
import { UserRole, Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { Router } from 'express';


interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response) => {
  const { email, password, companyId, firstName, lastName, role } = req.body;
  if (!email || !password || !companyId || !firstName || !lastName || !role) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try {
    const existingUser = await prismaService.user.findUnique({
      where: { email_companyId: { email, companyId } },
    });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already available in this company' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const newUser = await prismaService.user.create({
      data: {
        email,
        password: hashed,
        companyId,
        firstName,
        lastName,
        role: role as UserRole, 
      },
    });
    const newEmployee = await prismaService.employee.create({
        data: {
            companyId: newUser.companyId,
            userId: newUser.id,
            email: newUser.email,
            firstName: newUser.firstName,
            lastName: newUser.lastName,
            employeeId: `EMP-${Math.random().toString(36).substring(7).toUpperCase()}`,
            hireDate: new Date(),
            employmentType: 'FULL_TIME',
        },
    });
    return res.status(201).json({
      message: 'User added, Employee recorded',
      user: { id: newUser.id, email: newUser.email, role: newUser.role },
      employee: { id: newEmployee.id, employeeId: newEmployee.employeeId },
    });
  } catch (err) {
    console.error('Registration error ', err);
    return res.status(500).json({ message: 'Internal server error during registration' });
  }
});
authRouter.post('/login', async (req: Request, res: Response) => {
  const { email, password, companyId } = req.body;
  if (!email || !password || !companyId) {
    return res.status(400).json({ message: 'Email, password, and company ID are required.' });
  }
  try {
    const user = await prismaService.user.findUnique({
      where: { email_companyId: { email, companyId } },
    });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials or user not found.' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }
    const payload: JwtPayload = {
      userId: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
    };
    const accessToken = jwtService.generateAccessToken(payload);
    const refreshToken = jwtService.generateRefreshToken(payload);
    await prismaService.userSession.upsert({
      where: { id: user.id },
      update: {
        sessionToken: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + (parseInt(process.env['JWT_REFRESH_EXPIRATION_SECONDS'] || '604800') * 1000)),
        deviceInfo: req.headers['user-agent'] ? req.headers['user-agent'] : Prisma.JsonNull,
        ipAddress: typeof req.ip === 'string' ? req.ip : null,
      },
      create: {
        userId: user.id,
        sessionToken: accessToken,
        refreshToken,
        expiresAt: new Date(Date.now() + (parseInt(process.env['JWT_REFRESH_EXPIRATION_SECONDS'] || '604800') * 1000)),
        deviceInfo: req.headers['user-agent'] ? req.headers['user-agent'] :Prisma.JsonNull,
        ipAddress: typeof req.ip === 'string' ? req.ip : null,
      },
    });
    await redisClient.set(`refreshToken:${user.id}`, refreshToken, parseInt(process.env['JWT_REFRESH_EXPIRATION_SECONDS'] || '604800'));
    return res.json({ accessToken, refreshToken });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error during login.' });
  }
});

authRouter.post('/refresh-token', async (req: Request, res: Response) => {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(400).json({ message: 'Refresh token is required.' });
  }
  try {
    const decoded = jwtService.verifyRefreshToken(refreshToken) as JwtPayload;
    const storedRefreshToken = await redisClient.get(`refreshToken:${decoded.userId}`);
    if (!storedRefreshToken || storedRefreshToken !== refreshToken) {
      return res.status(403).json({ message: 'Invalid or expired refresh token (Redis mismatch).' });
    }
    const userSession = await prismaService.userSession.findUnique({
      where: { id: decoded.userId },
    });
    if (!userSession || userSession.refreshToken !== refreshToken || userSession.expiresAt < new Date()) {
      return res.status(403).json({ message: 'Invalid or expired refresh token (Database mismatch).' });
    }
    const newAccessToken = jwtService.generateAccessToken(decoded);
    const newRefreshToken = jwtService.generateRefreshToken(decoded);
    await prismaService.userSession.update({
      where: { id: decoded.userId },
      data: {
        sessionToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresAt: new Date(Date.now() + (parseInt(process.env['JWT_REFRESH_EXPIRATION_SECONDS'] || '604800') * 1000)),
      },
    });
    await redisClient.set(`refreshToken:${decoded.userId}`, newRefreshToken, parseInt(process.env['JWT_REFRESH_EXPIRATION_SECONDS'] || '604800'));
    return res.json({ accessToken: newAccessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired', error: error.message });
    }
    console.error('Refresh token error:', error);
    return res.status(500).json({ message: 'Internal server error during token refresh.' });
  }
});

authRouter.post('/logout', async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication required: User not identified.' });
  }
  try {
    await redisClient.del(`refreshToken:${userId}`);
    await prismaService.userSession.deleteMany({
      where: { id: userId },
    });
    return res.status(200).json({ message: 'Logged out successfully.' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ message: 'Internal server error during logout.' });
  }
});

export default authRouter;