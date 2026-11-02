import { prisma } from '../config/db.js';

export class AvailabilityService {
  static async createSlots(doctorId, slots) {
    if (!slots || slots.length === 0) {
      throw new Error('At least one slot is required');
    }

    // Verify doctor exists and is approved
    const doctor = await prisma.doctor.findUnique({
      where: { id: doctorId }
    });

    if (!doctor) {
      const error = new Error('Doctor not found');
      error.status = 404;
      throw error;
    }

    if (doctor.approvalStatus !== 'APPROVED') {
      const error = new Error('Only approved doctors can manage availability slots');
      error.status = 403;
      throw error;
    }

    // Process and validate each slot
    const slotData = [];
    for (const slot of slots) {
      const dateObj = new Date(slot.date);
      dateObj.setUTCHours(0, 0, 0, 0);

      // Construct precise timestamps
      const [startH, startM] = slot.startTime.split(':').map(Number);
      const [endH, endM] = slot.endTime.split(':').map(Number);

      const startTimestamp = new Date(dateObj);
      startTimestamp.setUTCHours(startH, startM, 0, 0);

      const endTimestamp = new Date(dateObj);
      endTimestamp.setUTCHours(endH, endM, 0, 0);

      if (endTimestamp <= startTimestamp) {
        throw new Error(`Invalid slot time: End time ${slot.endTime} must be after start time ${slot.startTime}`);
      }

      // Check for overlap with existing slots of this doctor
      const overlapping = await prisma.availabilitySlot.findFirst({
        where: {
          doctorId,
          isCancelled: false,
          OR: [
            {
              startTimestamp: { lte: startTimestamp },
              endTimestamp: { gt: startTimestamp }
            },
            {
              startTimestamp: { lt: endTimestamp },
              endTimestamp: { gte: endTimestamp }
            },
            {
              startTimestamp: { gte: startTimestamp },
              endTimestamp: { lte: endTimestamp }
            }
          ]
        }
      });

      if (overlapping) {
        const error = new Error(`Slot on ${slot.date} (${slot.startTime}-${slot.endTime}) overlaps with an existing slot.`);
        error.status = 409;
        throw error;
      }

      const durationMinutes = Math.round((endTimestamp - startTimestamp) / (1000 * 60));

      slotData.push({
        doctorId,
        date: dateObj,
        startTime: slot.startTime,
        endTime: slot.endTime,
        startTimestamp,
        endTimestamp,
        durationMinutes,
        isBooked: false,
        isCancelled: false
      });
    }

    const created = await prisma.$transaction(
      slotData.map(data => prisma.availabilitySlot.create({ data }))
    );

    return created;
  }

  static async getDoctorSlots(doctorId, { startDate, endDate, availableOnly = false }) {
    const where = {
      doctorId,
      isCancelled: false
    };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }

    if (availableOnly) {
      where.isBooked = false;
      where.startTimestamp = { gte: new Date() };
    }

    const slots = await prisma.availabilitySlot.findMany({
      where,
      orderBy: [
        { date: 'asc' },
        { startTimestamp: 'asc' }
      ],
      include: {
        appointment: {
          select: {
            id: true,
            appointmentNumber: true,
            status: true,
            patient: {
              select: {
                id: true,
                username: true,
                phone: true
              }
            }
          }
        }
      }
    });

    return slots;
  }

  static async deleteSlot(slotId, doctorId) {
    const slot = await prisma.availabilitySlot.findUnique({
      where: { id: slotId },
      include: { appointment: true }
    });

    if (!slot) {
      const error = new Error('Slot not found');
      error.status = 404;
      throw error;
    }

    if (slot.doctorId !== doctorId) {
      const error = new Error('Unauthorized to delete this slot');
      error.status = 403;
      throw error;
    }

    if (slot.isBooked || slot.appointment) {
      const error = new Error('Cannot delete a slot that already has a booked appointment. Please cancel or reschedule the appointment first.');
      error.status = 400;
      throw error;
    }

    await prisma.availabilitySlot.delete({
      where: { id: slotId }
    });

    return { message: 'Slot deleted successfully' };
  }
}
