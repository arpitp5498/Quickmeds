const request = require('supertest');
const { app } = require('../src/index');
const Address = require('../src/models/Address');
const User = require('../src/models/User');
const { generateToken } = require('../src/services/authService');

describe('Saved delivery locations', () => {
  let user, auth;
  const fields = { label: 'Home', street: 'Fixture street', city: 'Mumbai', state: 'Maharashtra', pincode: '400050' };
  beforeAll(async () => {
    user = await User.create({ name: 'Address fixture', role: 'CUSTOMER', phone: '9876548765',
      email: 'address-fixture@example.invalid', password: 'Password@123' });
    auth = 'Bearer ' + generateToken(user);
  });

  it('saves postal information without inventing a location', async () => {
    const response = await request(app).post('/api/users/addresses').set('Authorization', auth).send(fields).expect(201);
    expect(response.body.data.address.coordinates).toBeUndefined();
    expect(response.body.data.address.coordinatesConfirmed).toBe(false);
  });

  it('requires confirmation of legacy default coordinates and retains an explicitly confirmed point', async () => {
    const address = await Address.create({ ...fields, userId: user._id, recipientName: user.name, phone: user.phone,
      fullAddress: 'Fixture street, Mumbai', coordinates: [77.209, 28.6139] });
    const endpoint = '/api/users/addresses/' + address.id;
    const read = async () => {
      const response = await request(app).get('/api/users/addresses').set('Authorization', auth).expect(200);
      return response.body.data.addresses.find(row => row._id === address.id);
    };
    expect((await read()).coordinatesConfirmed).toBe(false);
    await request(app).put(endpoint).set('Authorization', auth).send({coordinates: [200, 12]}).expect(400);
    await request(app).put(endpoint).set('Authorization', auth).send({coordinates: [77.209, 28.6139]}).expect(200);
    expect((await read()).coordinatesConfirmed).toBe(true);
    await request(app).put(endpoint).set('Authorization', auth).send({city: 'Noida'}).expect(200);
    expect((await read()).coordinatesConfirmed).toBe(false);
  });
});
