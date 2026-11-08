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
  const search = async () => (await request(app).get('/api/medicines').query({ q: medicine.name }).expect(200)).body.data.medicines.find(m => m._id === String(medicine._id));
  const clear = () => request(app).delete('/api/cart').set('Authorization', authorization).expect(200);

  it('selects eligible offers by price and by the full resulting cart quantity', async () => {
    expect(await search()).toMatchObject({ stockStatus: 'IN_STOCK', availablePharmaciesCount: 2, lowestPrice: 70 });
    const sos = await request(app).get('/api/medicines/sos').expect(200);
    expect(sos.body.data.medicines.find(m => m._id === String(medicine._id)).availablePharmaciesCount).toBe(2);
    let res = await add(2).expect(200);
    expect(res.body.data.cart.items[0]).toMatchObject({ price: 70, quantity: 2, pharmacyId: String(first.pharmacyId) });
    res = await add(1).expect(200);
    expect(res.body.data.cart).toMatchObject({ subtotal: 240, hasPrescriptionRequiredItems: true });
    expect(res.body.data.cart.items[0].pharmacyId).toBe(String(second.pharmacyId));
    await update(4).expect(200);
    await update(5).expect(409);
    expect((await update(1).expect(200)).body.data.cart.subtotal).toBe(70);
    const rerouted = await add(2, first.pharmacyId).expect(200);
    expect(rerouted.body.data.cart.items[0].pharmacyId).toBe(String(second.pharmacyId));
    await clear();
  });

  it('assigns the nearby pharmacy even if the customer supplies a cheaper distant store', async () => {
    const distant = await makeOffer('Distant fixture', 5, 8);
    await Pharmacy.updateOne({ _id: distant.pharmacyId }, { 'location.coordinates': [78, 29] });
    const coordinates = [77.2, 28.6];
    const guest = await request(app).get('/api/medicines/' + medicine._id + '/quote')
      .query({ quantity: 1, lng: coordinates[0], lat: coordinates[1] }).expect(200);
    expect(guest.body.data.pharmacyId).toBe(String(first.pharmacyId));
    const added = await request(app).post('/api/cart/items').set('Authorization', authorization)
      .send({ coordinates, medicineId: medicine._id, quantity: 1, pharmacyId: distant.pharmacyId }).expect(200);
    expect(added.body.data.cart.items[0].pharmacyId).toBe(String(first.pharmacyId));
    const quote = await request(app).post('/api/cart/quote').set('Authorization', authorization)
      .send({ coordinates, pharmacyId: distant.pharmacyId }).expect(200);
    expect(quote.body.data.recommended.pharmacies[0]._id).toBe(String(first.pharmacyId));
    expect(quote.body.data.recommended.priceBreakdown.itemsSubtotal).toBe(70);
    // Complete an OTC purchase only in the disposable test database.
    await Medicine.updateOne({ _id: medicine._id }, { requiresPrescription: false });
    const deliveryAddress = { street: 'Test', city: 'Delhi', state: 'Delhi', pincode: '110001',
      fullAddress: 'Test Delhi', coordinates };
    const payload = { deliveryAddress, paymentMethod: 'COD', pharmacyId: distant.pharmacyId,
      confirmedTotal: quote.body.data.recommended.totalOrderValue };
    await request(app).post('/api/orders').set('Authorization', authorization)
      .send({ ...payload, confirmedTotal: payload.confirmedTotal + 1 }).expect(409);
    const placed = await request(app).post('/api/orders').set('Authorization', authorization).send(payload).expect(201);
    expect(placed.body.data.order.pharmacyId).toBe(String(first.pharmacyId));
    expect(placed.body.data.order.total).toBe(payload.confirmedTotal);
    await Medicine.updateOne({ _id: medicine._id }, { requiresPrescription: true });
    await Inventory.deleteOne({ _id: distant._id });
  });

  it('shows stocked matches before newer unconfirmed matches across pages', async () => {
    const unstocked = medicine.toObject();
    delete unstocked._id;
    delete unstocked.createdAt;
    delete unstocked.updatedAt;
    const newer = await Medicine.create({ ...unstocked, name: 'Stock Fixture unconfirmed' });
    const page = async number => (await request(app).get('/api/medicines')
      .query({ q: 'Stock Fixture', limit: 1, page: number }).expect(200)).body.data.medicines[0];
    expect(await page(1)).toMatchObject({ _id: String(medicine._id), stockStatus: 'IN_STOCK' });
    expect(await page(2)).toMatchObject({ _id: String(newer._id), stockStatus: 'UNKNOWN' });
  });

  it.each([0, -1, 1.5, 'many', [1], 101].map(value => [value]))('rejects invalid quantity %j', async quantity => {
    await add(quantity).expect(400);
    await update(quantity).expect(400);
  });

  it('distinguishes confirmed zero, incomplete balances and missing mappings', async () => {
    await add(1).expect(200);
    await Inventory.updateMany({ medicineId: medicine._id }, { stockQuantity: 0 });
    expect(await search()).toMatchObject({ availablePharmaciesCount: 0, stockStatus: 'OUT_OF_STOCK' });
    await add(1).expect(409);
    const checkout = await request(app).post('/api/orders').set('Authorization', authorization)
      .send({ paymentMethod: 'COD',
        deliveryAddress: { street: 'Test', city: 'Delhi', pincode: '110001', coordinates: [77.2, 28.6] } }).expect(409);
    expect(checkout.body.message).toMatch(/fulfil|availability|stock/i);
    await Inventory.collection.updateOne({ _id: first._id }, { $unset: { stockQuantity: '' } });
    expect((await search()).stockStatus).toBe('UNKNOWN');
    await Inventory.deleteMany({ medicineId: medicine._id });
    expect((await search()).stockStatus).toBe('UNKNOWN');
    await Inventory.collection.insertOne({ medicineId: medicine._id, pharmacyId: new mongoose.Types.ObjectId(),
      stockQuantity: 9, price: 70, isAvailable: true, expiryDate: new Date(Date.now() + 86400000) });
    const detail = (await request(app).get('/api/medicines/' + medicine._id).expect(200)).body.data;
    expect(detail.medicine.stockStatus).toBe('UNKNOWN');
    expect(detail.pharmacies).toHaveLength(0);
    await add(1).expect(409);
  });
});
