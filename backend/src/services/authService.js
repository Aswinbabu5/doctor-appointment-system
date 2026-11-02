import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db.js';
import { env } from '../config/env.js';

export class AuthService {
  static async registerUser(data) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const user = await prisma.user.create({
      data: {
        email: data.email.toLowerCase(),
        passwordHash,
        username: data.username,
        phone: data.phone || null,
        role: 'USER'
      },
      select: {
        id: true,
        email: true,
        username: true,
        phone: true,
        role: true,
        createdAt: true
      }
    });

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role 
      },
      env.JWT_SECRET,
      { 
        expiresIn: env.JWT_EXPIRES_IN 
      }
    );

    return { user, token };
  }

  static async registerDoctor(data) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existing) {
      const error = new Error('An account with this email address already exists');
      error.status = 409;
      throw error;
    }

    const existingReg = await prisma.doctor.findUnique({
      where: { medicalRegNumber: data.medicalRegNumber }
    });

    if (existingReg) {
      const error = new Error('A doctor with this Medical Registration Number already exists');
      error.status = 409;
      throw error;
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(data.password, salt);

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash,
          username: data.username,
          phone: data.phone || null,
          role: 'DOCTOR'
        }
      });

      const doctor = await tx.doctor.create({
        data: {
          userId: user.id,
          specialization: data.specialization,
          qualifications: data.qualifications,
          medicalRegNumber: data.medicalRegNumber,
          experienceYears: data.experienceYears,
          consultationFee: data.consultationFee,
          bio: data.bio || null,
          approvalStatus: 'PENDING'
        }
      });

      if (data.documents && data.documents.length > 0) {
        await tx.doctorDocument.createMany({
          data: data.documents.map(doc => ({
            doctorId: doctor.id,
            originalName: doc.originalName,
            fileKey: doc.fileKey,
            filePath: doc.filePath,
            mimeType: doc.mimeType,
            fileSize: doc.fileSize,
            documentType: doc.documentType || 'CERTIFICATE'
          }))
        });
      }

      return { user, doctor };
    });

    const token = jwt.sign(
      { userId: result.user.id, email: result.user.email, role: result.user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    return {
      user: {
        id: result.user.id,
        email: result.user.email,
        username: result.user.username,
        phone: result.user.phone,
        role: result.user.role,
        doctorProfile: result.doctor
      },
      token
    };
  }

  static async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        doctorProfile: true
      }
    });

    if (!user) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    if (!user.isActive) {
      const error = new Error('Your account has been deactivated. Please contact support.');
      error.status = 403;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      const error = new Error('Invalid email or password');
      error.status = 401;
      throw error;
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN }
    );

    const { passwordHash: _, ...safeUser } = user;
    return { user: safeUser, token };
  }

  static async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        doctorProfile: {
          include: {
            documents: true
          }
        }
      }
    });

    if (!user) {
      const error = new Error('User not found');
      error.status = 404;
      throw error;
    }

    const { passwordHash: _, ...safeUser } = user;
    return safeUser;
  }
}
