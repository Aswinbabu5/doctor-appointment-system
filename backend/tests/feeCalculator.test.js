import { describe, it, expect } from 'vitest';
import { calculateFeeBreakdown } from '../src/utils/feeCalculator.js';

describe('Fee and Commission Calculator (Minor Units Arithmetic)', () => {
  it('calculates 10% percentage commission correctly on 1000 INR', () => {
    const result = calculateFeeBreakdown({
      doctorFee: 1000,
      commissionType: 'PERCENTAGE',
      commissionValue: 10
    });

    expect(result.doctorFee).toBe(1000);
    expect(result.commissionType).toBe('PERCENTAGE');
    expect(result.commissionRate).toBe(10);
    expect(result.commissionAmount).toBe(100);
    expect(result.totalAmount).toBe(1100);
  });

  it('calculates 15% commission correctly on 750 INR without rounding errors', () => {
    const result = calculateFeeBreakdown({
      doctorFee: 750,
      commissionType: 'PERCENTAGE',
      commissionValue: 15
    });

    expect(result.doctorFee).toBe(750);
    expect(result.commissionAmount).toBe(112.50);
    expect(result.totalAmount).toBe(862.50);
  });

  it('calculates fixed commission of 50 INR correctly', () => {
    const result = calculateFeeBreakdown({
      doctorFee: 500,
      commissionType: 'FIXED',
      commissionValue: 50
    });

    expect(result.doctorFee).toBe(500);
    expect(result.commissionAmount).toBe(50);
    expect(result.totalAmount).toBe(550);
  });

  it('throws error for invalid doctor fee', () => {
    expect(() => calculateFeeBreakdown({ doctorFee: -50 })).toThrow();
    expect(() => calculateFeeBreakdown({ doctorFee: 'abc' })).toThrow();
  });
});
