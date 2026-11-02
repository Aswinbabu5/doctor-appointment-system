import { prisma } from '../config/db.js';

export class DoctorService {
  static async getApprovedDoctors({
    search = '',
    specialization = '',
    minFee,
    maxFee,
    page = 1,
    limit = 10,
    sortBy = 'rating'
  }) {
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const where = {
      approvalStatus: 'APPROVED',
      user: {
        isActive: true
      }
    };

    if (specialization) {
      where.specialization = { equals: specialization };
    }

    if (minFee !== undefined || maxFee !== undefined) {
      where.consultationFee = {};
      if (minFee !== undefined) where.consultationFee.gte = Number(minFee);
      if (maxFee !== undefined) where.consultationFee.lte = Number(maxFee);
    }

    if (search) {
      where.OR = [
        { user: { username: { contains: search } } },
        { specialization: { contains: search } },
        { qualifications: { contains: search } }
      ];
    }

    let orderBy = { experienceYears: 'desc' };
    if (sortBy === 'fee_asc') orderBy = { consultationFee: 'asc' };
    if (sortBy === 'fee_desc') orderBy = { consultationFee: 'desc' };
    if (sortBy === 'experience') orderBy = { experienceYears: 'desc' };

    const [doctors, total] = await Promise.all([
      prisma.doctor.findMany({
        where,
        skip,
        take: limitNum,
        orderBy,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
              phone: true
            }
          },
          availabilitySlots: {
            where: {
              isBooked: false,
              isCancelled: false,
              startTimestamp: { gte: new Date() }
            },
            take: 3,
            orderBy: { startTimestamp: 'asc' }
          }
        }
      }),
      prisma.doctor.count({ where })
    ]);

    return {
      doctors,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    };
  }

  static async getDoctorById(id) {
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true,
            isActive: true
          }
        },
        documents: {
          select: {
            id: true,
            originalName: true,
            filePath: true,
            documentType: true,
            createdAt: true
          }
        }
      }
    });

    if (!doctor || !doctor.user.isActive) {
      const error = new Error('Doctor profile not found or inactive');
      error.status = 404;
      throw error;
    }

    return doctor;
  }

  static async updateDoctorProfile(doctorId, data) {
    const doctor = await prisma.doctor.update({
      where: { id: doctorId },
      data: {
        specialization: data.specialization,
        qualifications: data.qualifications,
        experienceYears: data.experienceYears,
        consultationFee: data.consultationFee,
        bio: data.bio,
        avatarUrl: data.avatarUrl
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            phone: true
          }
        }
      }
    });

    return doctor;
  }

  static async uploadDocument(doctorId, file, documentType = 'CERTIFICATE') {
    const doc = await prisma.doctorDocument.create({
      data: {
        doctorId,
        originalName: file.originalname,
        fileKey: file.filename,
        filePath: `/uploads/${file.filename}`,
        mimeType: file.mimetype,
        fileSize: file.size,
        documentType
      }
    });

    return doc;
  }
}
