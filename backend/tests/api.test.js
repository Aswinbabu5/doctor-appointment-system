import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/db.js';

describe('Doctor Appointment System API Integration Tests', () => {
  let adminToken;
  let patientToken;
  let doctorToken;
  let testPatientId;
  let testDoctorId;
  let approvedDoctorId;

  beforeAll(async () => {
    // Clean up any test slots from previous runs
    await prisma.availabilitySlot.deleteMany({
      where: {
        date: new Date('2026-11-20T00:00:00.000Z')
      }
    });

    // 1. Admin login
    const adminRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@doccare.com',
        password: 'Admin@123'
      });
    expect(adminRes.status).toBe(200);
    adminToken = adminRes.body.data.token;

    // 2. Patient login
    const patientRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'patient@doccare.com',
        password: 'Password@123'
      });
    expect(patientRes.status).toBe(200);
    patientToken = patientRes.body.data.token;
    testPatientId = patientRes.body.data.user.id;

    // 3. Approved Doctor login
    const doctorRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'dr.priya@doccare.com',
        password: 'Password@123'
      });
    expect(doctorRes.status).toBe(200);
    doctorToken = doctorRes.body.data.token;
    approvedDoctorId = doctorRes.body.data.user.doctorProfile.id;
  });

  afterAll(async () => {
    // Clean up any test users created during test suite
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          in: ['new.patient@test.com', 'new.doctor@test.com']
        }
      },
      include: { doctorProfile: true }
    });

    for (const u of testUsers) {
      if (u.doctorProfile) {
        await prisma.prescription.deleteMany({ where: { doctorId: u.doctorProfile.id } });
        await prisma.appointment.deleteMany({ where: { doctorId: u.doctorProfile.id } });
        await prisma.availabilitySlot.deleteMany({ where: { doctorId: u.doctorProfile.id } });
        await prisma.doctorDocument.deleteMany({ where: { doctorId: u.doctorProfile.id } });
        await prisma.doctor.deleteMany({ where: { id: u.doctorProfile.id } });
      }
      await prisma.user.delete({ where: { id: u.id } });
    }

    await prisma.availabilitySlot.deleteMany({
      where: {
        date: new Date('2026-11-20T00:00:00.000Z')
      }
    });

    await prisma.$disconnect();
  });

  describe('1. Health Check Endpoint', () => {
    it('returns status ok', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('2. Authentication and Registration Flows', () => {
    it('registers a new patient successfully', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'new.patient@test.com',
          password: 'Password@123',
          fullName: 'Test Patient',
          phone: '+91 99999 88888'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('USER');
      expect(res.body.data.token).toBeDefined();
    });

    it('registers a doctor with default PENDING approval status', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register-doctor')
        .send({
          email: 'new.doctor@test.com',
          password: 'Password@123',
          fullName: 'Dr. Test Specialist',
          phone: '+91 99999 77777',
          specialization: 'Neurology',
          qualifications: 'MBBS, DM (Neurology)',
          medicalRegNumber: 'MCI-NEURO-TEST-001',
          experienceYears: 7,
          consultationFee: 1500,
          bio: 'Brain and nerve disorders specialist'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.doctorProfile.approvalStatus).toBe('PENDING');
      testDoctorId = res.body.data.user.doctorProfile.id;
    });

    it('rejects registration with duplicate email (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'admin@doccare.com',
          password: 'Password@123',
          fullName: 'Duplicate Admin'
        });

      expect(res.status).toBe(409);
    });

    it('rejects login with invalid credentials (401 Unauthorized)', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'admin@doccare.com',
          password: 'WrongPassword'
        });

      expect(res.status).toBe(401);
    });
  });

  describe('3. Public Doctor Directory & Approval Status Guards', () => {
    it('lists ONLY approved doctors in public directory', async () => {
      const res = await request(app).get('/api/v1/doctors');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.doctors)).toBe(true);

      // Verify no pending or rejected doctors appear
      for (const doc of res.body.doctors) {
        expect(doc.approvalStatus).toBe('APPROVED');
      }
    });

    it('prevents pending doctor from creating availability slots (403 Forbidden)', async () => {
      // Login as the newly registered pending doctor
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'new.doctor@test.com',
          password: 'Password@123'
        });

      const pendingToken = loginRes.body.data.token;

      const res = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${pendingToken}`)
        .send({
          slots: [
            { date: '2026-11-10', startTime: '10:00', endTime: '10:30' }
          ]
        });

      expect(res.status).toBe(403);
    });
  });

  describe('4. Admin Approvals and Management', () => {
    it('allows admin to view pending doctors list', async () => {
      const res = await request(app)
        .get('/api/v1/admin/doctors/pending')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.some(d => d.id === testDoctorId);
      expect(found).toBe(true);
    });

    it('allows admin to approve a pending doctor', async () => {
      const res = await request(app)
        .patch(`/api/v1/admin/doctors/${testDoctorId}/approve`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.approvalStatus).toBe('APPROVED');
    });

    it('fetches real dashboard metrics with accurate counters', async () => {
      const res = await request(app)
        .get('/api/v1/admin/metrics')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics.totalDoctors).toBeGreaterThan(0);
      expect(res.body.data.metrics.totalPatients).toBeGreaterThan(0);
    });
  });

  describe('5. Availability Management and Overlap Guard', () => {
    it('creates availability slots for approved doctor', async () => {
      const res = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          slots: [
            { date: '2026-11-20', startTime: '16:00', endTime: '16:30' },
            { date: '2026-11-20', startTime: '16:30', endTime: '17:00' }
          ]
        });

      expect(res.status).toBe(201);
      expect(res.body.data.length).toBe(2);
    });

    it('prevents overlapping slots on the same date and time (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/availability')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          slots: [
            { date: '2026-11-20', startTime: '16:15', endTime: '16:45' } // overlaps with 16:00-16:30
          ]
        });

      expect(res.status).toBe(409);
    });
  });

  describe('6. Booking Flow, Double Booking Prevention & Fee Snapshotting', () => {
    let createdSlotId;
    let bookedAppointmentId;

    beforeAll(async () => {
      // Find an available slot for Priya Sharma
      const slot = await prisma.availabilitySlot.findFirst({
        where: {
          doctorId: approvedDoctorId,
          isBooked: false,
          startTimestamp: { gt: new Date() }
        }
      });
      expect(slot).toBeDefined();
      createdSlotId = slot.id;
    });

    it('books an appointment atomically with fee breakdown and commission', async () => {
      const res = await request(app)
        .post('/api/v1/appointments/book')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          slotId: createdSlotId,
          notes: 'Chest discomfort checkup'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.appointmentNumber).toBeDefined();
      expect(res.body.data.status).toBe('BOOKED');
      expect(Number(res.body.data.doctorFee)).toBe(1000);
      expect(Number(res.body.data.commissionAmount)).toBe(100);
      expect(Number(res.body.data.totalAmount)).toBe(1100);
      bookedAppointmentId = res.body.data.id;
    });

    it('prevents double-booking the same slot (409 Conflict)', async () => {
      const res = await request(app)
        .post('/api/v1/appointments/book')
        .set('Authorization', `Bearer ${patientToken}`)
        .send({
          slotId: createdSlotId,
          notes: 'Simultaneous duplicate booking attempt'
        });

      expect(res.status).toBe(409);
    });

    it('allows doctor to start consultation and issue prescription', async () => {
      // Update status to IN_PROGRESS
      const statusRes = await request(app)
        .patch(`/api/v1/appointments/${bookedAppointmentId}/status`)
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({ status: 'IN_PROGRESS' });

      expect(statusRes.status).toBe(200);
      expect(statusRes.body.data.status).toBe('IN_PROGRESS');

      // Issue prescription (which marks appointment COMPLETED)
      const rxRes = await request(app)
        .post('/api/v1/prescriptions')
        .set('Authorization', `Bearer ${doctorToken}`)
        .send({
          appointmentId: bookedAppointmentId,
          diagnosis: 'Mild Sinus Bradycardia',
          clinicalNotes: 'ECG normal. Resting heart rate 54 bpm.',
          items: [
            {
              medicineName: 'Multivitamin',
              dosage: '1 tab',
              frequency: '1-0-0',
              duration: '15 days',
              instructions: 'Take after breakfast'
            }
          ]
        });

      expect(rxRes.status).toBe(201);
      expect(rxRes.body.data.diagnosis).toBe('Mild Sinus Bradycardia');
      expect(rxRes.body.data.items.length).toBe(1);

      // Verify appointment is now COMPLETED
      const apptCheck = await request(app)
        .get(`/api/v1/appointments/${bookedAppointmentId}`)
        .set('Authorization', `Bearer ${patientToken}`);

      expect(apptCheck.body.data.status).toBe('COMPLETED');
    });
  });

  describe('7. Notifications', () => {
    it('fetches patient notifications and marks as read', async () => {
      const res = await request(app)
        .get('/api/v1/notifications')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const markRes = await request(app)
        .post('/api/v1/notifications/read-all')
        .set('Authorization', `Bearer ${patientToken}`);

      expect(markRes.status).toBe(200);
    });
  });
});
