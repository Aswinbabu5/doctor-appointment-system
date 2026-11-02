/**
 * Accurate fee and commission calculator using integer minor units (paise/cents).
 * Avoids IEEE-754 floating point precision errors.
 */

export function calculateFeeBreakdown({
  doctorFee,
  commissionType = 'PERCENTAGE',
  commissionValue = 10
}) {
  const docFeeNum = Number(doctorFee);
  if (isNaN(docFeeNum) || docFeeNum < 0) {
    throw new Error('Doctor fee must be a non-negative number');
  }

  // Convert to minor units (multiply by 100 and round)
  const doctorFeeMinor = Math.round(docFeeNum * 100);
  let commissionMinor = 0;

  if (commissionType === 'PERCENTAGE') {
    const rate = Number(commissionValue);
    commissionMinor = Math.round((doctorFeeMinor * rate) / 100);
  } else if (commissionType === 'FIXED') {
    const fixedFeeNum = Number(commissionValue);
    commissionMinor = Math.round(fixedFeeNum * 100);
  } else {
    throw new Error(`Unsupported commission type: ${commissionType}`);
  }

  const totalMinor = doctorFeeMinor + commissionMinor;

  return {
    doctorFee: Number((doctorFeeMinor / 100).toFixed(2)),
    commissionType,
    commissionRate: Number(commissionValue),
    commissionAmount: Number((commissionMinor / 100).toFixed(2)),
    totalAmount: Number((totalMinor / 100).toFixed(2)),
    doctorFeeMinor,
    commissionMinor,
    totalMinor
  };
}
