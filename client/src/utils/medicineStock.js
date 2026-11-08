export function stockLabel(medicine) {
  const count = medicine?.availablePharmaciesCount;
  if (Number.isSafeInteger(count) && count > 0 && medicine.stockStatus === 'IN_STOCK') return 'In Stock';
  if (count === 0 && medicine?.stockStatus === 'OUT_OF_STOCK') return 'Out of Stock';
  return 'Availability Unknown';
}
