const request = require('supertest');
const mongoose = require('mongoose');
const { app } = require('../src/index');
const Medicine = require('../src/models/Medicine');
const Pharmacy = require('../src/models/Pharmacy');
const Inventory = require('../src/models/PharmacyInventory');
const User = require('../src/models/User');
const { generateToken } = require('../src/services/authService');

describe('Purchasable medicine inventory', () => {
  let medicine, authorization, first, second;

  async function makeOffer(name, price, stockQuantity, expiryDate) {
    const pharmacy = await Pharmacy.create({
      userId: new mongoose.Types.ObjectId(), name, licenseNumber: name, phone: '9876543210',
      email: 'stock@example.invalid', verificationStatus: 'VERIFIED', isOpen: true,
      address: { street: 'Test', city: 'Delhi', state: 'Delhi', pincode: '110001', fullAddress: 'Test Delhi' },
      location: { type: 'Point', coordinates: [77.2, 28.6] }
    });
    return Inventory.create({ medicineId: medicine._id, pharmacyId: pharmacy._id, price, stockQuantity, expiryDate });
  }

  beforeAll(async () => {
    const user = await User.create({ name: 'Stock Tester', email: 'stock-fixture@example.invalid',
      password: 'Password@123', phone: '9812345678', role: 'CUSTOMER' });
    authorization = 'Bearer ' + generateToken(user);
    medicine = await Medicine.create({ name: 'Stock Fixture', genericName: 'Stock Fixture', brand: 'Fixture',
      manufacturer: 'Fixture', strength: '10mg', dosageForm: 'Tablet', category: 'Pain & Fever',
      description: 'Test fixture', mrp: 100, sosEligible: true, requiresPrescription: true });
    await makeOffer('Expired fixture', 10, 20, new Date(0));
    first = await makeOffer('First fixture', 70, 2);
    second = await makeOffer('Second fixture', 80, 4);
  });

  const add = (quantity, pharmacyId) => request(app).post('/api/cart/items').set('Authorization', authorization)
    .send({ medicineId: medicine._id, quantity, pharmacyId });
  const update = quantity => request(app).put('/api/cart/items/' + medicine._id).set('Authorization', authorization).send({ quantity });
  const search = async () => (await request(app).get('/api/medicines').query({ q: medicine.name }).expect(200)).body.data.medicines[0];
  const clear = () => request(app).delete('/api/cart').set('Authorization', authorization).expect(200);

  it('selects eligible offers by price and by the full resulting cart quantity', async () => {
    expect(await search()).toMatchObject({ availablePharmaciesCount: 2, lowestPrice: 70 });
    const sos = await request(app).get('/api/medicines/sos').expect(200);
    expect(sos.body.data.medicines.find(m => m._id === String(medicine._id)).availablePharmaciesCount).toBe(2);
    let res = await add(2).expect(200);
    expect(res.body.data.cart.items[0]).toMatchObject({ price: 70, quantity: 2, pharmacyId: String(first.pharmacyId) });
    res = await add(1).expect(200);
    expect(res.body.data.cart).toMatchObject({ subtotal: 240, hasPrescriptionRequiredItems: true });
    expect(res.body.data.cart.items[0].pharmacyId).toBe(String(second.pharmacyId));
    await update(4).expect(200);
    await update(5).expect(409);
    expect((await update(1).expect(200)).body.data.cart.subtotal).toBe(80);
    await add(2, first.pharmacyId).expect(409);
    await clear();
  });

  it.each([0, -1, 1.5, 'many', [1], 101].map(value => [value]))('rejects invalid quantity %j', async quantity => {
    await add(quantity).expect(400);
    await update(quantity).expect(400);
  });

  it('reports zero stock and missing inventory consistently', async () => {
    await Inventory.updateMany({ medicineId: medicine._id }, { stockQuantity: 0 });
    expect((await search()).availablePharmaciesCount).toBe(0);
    await add(1).expect(409);
    await Inventory.deleteMany({ medicineId: medicine._id });
    expect((await search()).availablePharmaciesCount).toBe(0);
    await add(1).expect(409);
  });
});
