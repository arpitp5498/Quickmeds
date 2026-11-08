export function stockLabel(medicine) {
  const count = medicine?.availablePharmaciesCount;
  if (Number.isSafeInteger(count) && count > 0 && medicine.stockStatus === 'IN_STOCK') return 'In Stock';
  if (count === 0 && medicine?.stockStatus === 'OUT_OF_STOCK') return 'Out of Stock';
  return 'Availability Unknown';
}

export function deliveryAvailability(medicine, quantity = 1) {
  const stock = stockLabel(medicine);
  if (!Array.isArray(medicine?.deliveryOptions) || stock === 'Availability Unknown') {
    return { available: false, label: 'Availability Unknown' };
  }
  if (stock === 'Out of Stock') return { available: false, label: stock };
  const options = medicine.deliveryOptions.filter(o => Number.isFinite(o?.etaMinutes) && o.maxQuantity >= quantity);
  if (!options.length) return { available: false, label: quantity > 1
    ? 'Quantity unavailable at this address' : 'No confirmed delivery to this address' };
  const times = options.map(o => o.etaMinutes);
  const min = Math.min(...times), max = Math.max(...times);
  return { available: true, label: `Delivers to you · est. ${min === max ? min : min + '–' + max} min` };
}
