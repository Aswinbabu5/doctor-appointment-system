import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding MySQL database for Doctor Appointment System...');

  // Upsert App Settings
  await prisma.appSetting.upsert({
    where: { id: 1 },
    update: {
      appName: 'DocCare Connect',
      commissionType: 'PERCENTAGE',
      commissionValue: 10.00,
      currency: 'INR',
      currencySymbol: '₹',
      supportEmail: 'support@doccare.com',
      cancellationCutoffHours: 24
    },
    create: {
      id: 1,
      appName: 'DocCare Connect',
      commissionType: 'PERCENTAGE',
      commissionValue: 10.00,
      currency: 'INR',
      currencySymbol: '₹',
      supportEmail: 'support@doccare.com',
      cancellationCutoffHours: 24
    }
  });

  const salt = await bcrypt.genSalt(10);
  const adminPass = await bcrypt.hash('Admin@123', salt);
  const userPass = await bcrypt.hash('Password@123', salt);

  // 1. Create Admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@doccare.com' },
    update: { passwordHash: adminPass, isActive: true },
    create: {
      email: 'admin@doccare.com',
      passwordHash: adminPass,
      username: 'Administrator',
      phone: '+91 98765 00001',
      role: 'ADMIN',
      isActive: true
    }
  });

  // 2. Create Patients
  const patient1 = await prisma.user.upsert({
    where: { email: 'patient@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'patient@doccare.com',
      passwordHash: userPass,
      username: 'Rahul Verma',
      phone: '+91 98765 11111',
      role: 'USER',
      isActive: true
    }
  });

  const patient2 = await prisma.user.upsert({
    where: { email: 'alice@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'alice@doccare.com',
      passwordHash: userPass,
      username: 'Alice Johnson',
      phone: '+91 98765 22222',
      role: 'USER',
      isActive: true
    }
  });

  // 3. Create Approved Doctors
  const doc1User = await prisma.user.upsert({
    where: { email: 'dr.priya@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'dr.priya@doccare.com',
      passwordHash: userPass,
      username: 'Dr. Priya Sharma',
      phone: '+91 98765 33331',
      role: 'DOCTOR',
      isActive: true
    }
  });

  const doc1 = await prisma.doctor.upsert({
    where: { userId: doc1User.id },
    update: { approvalStatus: 'APPROVED' },
    create: {
      userId: doc1User.id,
      specialization: 'Cardiology',
      qualifications: 'MBBS, MD (Medicine), DM (Cardiology)',
      medicalRegNumber: 'MCI-CARD-2012-9988',
      experienceYears: 12,
      consultationFee: 1000.00,
      bio: 'Senior Interventional Cardiologist specializing in adult cardiovascular diseases, hypertension, and preventive health.',
      approvalStatus: 'APPROVED',
      approvedAt: new Date()
    }
  });

  const doc2User = await prisma.user.upsert({
    where: { email: 'dr.rajesh@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'dr.rajesh@doccare.com',
      passwordHash: userPass,
      username: 'Dr. Rajesh Kumar',
      phone: '+91 98765 33332',
      role: 'DOCTOR',
      isActive: true
    }
  });

  const doc2 = await prisma.doctor.upsert({
    where: { userId: doc2User.id },
    update: { approvalStatus: 'APPROVED' },
    create: {
      userId: doc2User.id,
      specialization: 'Dermatology',
      qualifications: 'MBBS, MD (Dermatology, Venereology & Leprosy)',
      medicalRegNumber: 'MCI-DERM-2016-5544',
      experienceYears: 8,
      consultationFee: 800.00,
      bio: 'Specialist in clinical and cosmetic dermatology, eczema, acne management, and pediatric skin care.',
      approvalStatus: 'APPROVED',
      approvedAt: new Date()
    }
  });

  const doc3User = await prisma.user.upsert({
    where: { email: 'dr.ananya@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'dr.ananya@doccare.com',
      passwordHash: userPass,
      username: 'Dr. Ananya Iyer',
      phone: '+91 98765 33333',
      role: 'DOCTOR',
      isActive: true
    }
  });

  const doc3 = await prisma.doctor.upsert({
    where: { userId: doc3User.id },
    update: { approvalStatus: 'APPROVED' },
    create: {
      userId: doc3User.id,
      specialization: 'Pediatrics',
      qualifications: 'MBBS, DCH, DNB (Pediatrics)',
      medicalRegNumber: 'MCI-PED-2014-7766',
      experienceYears: 10,
      consultationFee: 900.00,
      bio: 'Caring pediatrician passionate about child developmental milestones, immunizations, and pediatric wellness.',
      approvalStatus: 'APPROVED',
      approvedAt: new Date()
    }
  });

  // 4. Create Pending Doctor
  const docPendingUser = await prisma.user.upsert({
    where: { email: 'dr.vikram@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'dr.vikram@doccare.com',
      passwordHash: userPass,
      username: 'Dr. Vikram Patel',
      phone: '+91 98765 33334',
      role: 'DOCTOR',
      isActive: true
    }
  });

  const docPending = await prisma.doctor.upsert({
    where: { userId: docPendingUser.id },
    update: { approvalStatus: 'PENDING' },
    create: {
      userId: docPendingUser.id,
      specialization: 'Orthopedics',
      qualifications: 'MBBS, MS (Orthopedic Surgery)',
      medicalRegNumber: 'MCI-ORTHO-2018-3322',
      experienceYears: 6,
      consultationFee: 1200.00,
      bio: 'Joint replacement specialist and sports injury surgeon.',
      approvalStatus: 'PENDING'
    }
  });

  // Sample document for pending doctor
  await prisma.doctorDocument.deleteMany({ where: { doctorId: docPending.id } });
  await prisma.doctorDocument.create({
    data: {
      doctorId: docPending.id,
      originalName: 'Medical_Registration_Certificate_Vikram_Patel.pdf',
      fileKey: 'cert-vikram.pdf',
      filePath: '/uploads/sample_cert.pdf',
      mimeType: 'application/pdf',
      fileSize: 420000,
      documentType: 'CERTIFICATE'
    }
  });

  // 5. Create Rejected Doctor
  const docRejectedUser = await prisma.user.upsert({
    where: { email: 'dr.suresh@doccare.com' },
    update: { passwordHash: userPass, isActive: true },
    create: {
      email: 'dr.suresh@doccare.com',
      passwordHash: userPass,
      username: 'Dr. Suresh Menon',
      phone: '+91 98765 33335',
      role: 'DOCTOR',
      isActive: true
    }
  });

  await prisma.doctor.upsert({
    where: { userId: docRejectedUser.id },
    update: { approvalStatus: 'REJECTED' },
    create: {
      userId: docRejectedUser.id,
      specialization: 'General Medicine',
      qualifications: 'MBBS',
      medicalRegNumber: 'MCI-GEN-2005-1122',
      experienceYears: 18,
      consultationFee: 500.00,
      bio: 'General family physician.',
      approvalStatus: 'REJECTED',
      rejectionReason: 'Uploaded medical license image was blurry and could not be verified with state registry.',
      rejectedAt: new Date()
    }
  });

  // 6. Generate Availability Slots for the next 7 days for approved doctors
  const doctors = [doc1, doc2, doc3];
  const timeTemplates = [
    { start: '09:00', end: '09:30' },
    { start: '09:30', end: '10:00' },
    { start: '10:00', end: '10:30' },
    { start: '11:00', end: '11:30' },
    { start: '14:00', end: '14:30' },
    { start: '15:00', end: '15:30' }
  ];

  for (const doc of doctors) {
    for (let dayOffset = 1; dayOffset <= 5; dayOffset++) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];
      const slotDate = new Date(dateStr + 'T00:00:00.000Z');

      for (const t of timeTemplates) {
        const [sH, sM] = t.start.split(':').map(Number);
        const [eH, eM] = t.end.split(':').map(Number);

        const startTimestamp = new Date(slotDate);
        startTimestamp.setUTCHours(sH, sM, 0, 0);

        const endTimestamp = new Date(slotDate);
        endTimestamp.setUTCHours(eH, eM, 0, 0);

        await prisma.availabilitySlot.upsert({
          where: {
            doctorId_date_startTime: {
              doctorId: doc.id,
              date: slotDate,
              startTime: t.start
            }
          },
          update: {},
          create: {
            doctorId: doc.id,
            date: slotDate,
            startTime: t.start,
            endTime: t.end,
            startTimestamp,
            endTimestamp,
            durationMinutes: 30,
            isBooked: false,
            isCancelled: false
          }
        });
      }
    }
  }

  // 7. Create a Sample Appointment & Prescription
  // Find a slot for doc1
  const existingSlot = await prisma.availabilitySlot.findFirst({
    where: { doctorId: doc1.id, isBooked: false }
  });

  if (existingSlot) {
    await prisma.availabilitySlot.update({
      where: { id: existingSlot.id },
      data: { isBooked: true }
    });

  console.log("existing slot id: ", existingSlot.id)

    const appt = await prisma.appointment.upsert({
      where: { slotId: existingSlot.id },
      update: {},
      create: {
        appointmentNumber: 'DOC-SEED02',
        patientId: patient1.id,
        doctorId: doc1.id,
        slotId: existingSlot.id,
        scheduledDate: existingSlot.date,
        startTime: existingSlot.startTime,
        endTime: existingSlot.endTime,
        scheduledTimestamp: existingSlot.startTimestamp,
        status: 'COMPLETED',
        doctorFee: 1000.00,
        commissionType: 'PERCENTAGE',
        commissionRate: 10.00,
        commissionAmount: 100.00,
        totalAmount: 1100.00,
        completedAt: new Date(),
        notes: 'Routine hypertension follow-up'
      }
    });

    // Create prescription with items
    await prisma.prescription.upsert({
      where: { appointmentId: appt.id },
      update: {},
      create: {
        appointmentId: appt.id,
        patientId: patient1.id,
        doctorId: doc1.id,
        diagnosis: 'Stage 1 Essential Hypertension with mild dyslipidemia',
        clinicalNotes: 'Blood pressure measured 138/86 mmHg. Recommend maintaining DASH diet and moderate cardio exercise 30 mins daily.',
        followUpDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: {
          create: [
            {
              medicineName: 'Telmisartan 40mg',
              dosage: '40 mg',
              frequency: '1-0-0 (Morning before breakfast)',
              duration: '30 days',
              instructions: 'Monitor BP weekly and log values.'
            },
            {
              medicineName: 'Atorvastatin 10mg',
              dosage: '10 mg',
              frequency: '0-0-1 (At night after food)',
              duration: '30 days',
              instructions: 'Repeat lipid profile after 6 weeks.'
            }
          ]
        }
      }
    });
  }

  console.log('Seed completed successfully!');
  console.log('Demo Accounts:');
  console.log('  Admin:   admin@doccare.com / Admin@123');
  console.log('  Patient: patient@doccare.com / Password@123');
  console.log('  Doctor:  dr.priya@doccare.com / Password@123');
  console.log('  Pending: dr.vikram@doccare.com / Password@123');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
