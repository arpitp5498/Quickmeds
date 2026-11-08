const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const mongoose = require('mongoose');
const { transactional } = require('../src/middleware/transactional');
const { decrementInventory } = require('../src/services/orderService');
const Inventory = require('../src/models/PharmacyInventory');
async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'quickmeds-repl-'));
  const port = 33000 + Math.floor(Math.random() * 12000);
  const binary = process.env.MONGOD_BINARY || path.resolve(__dirname, '../node_modules/.cache/mongodb-memory-server/mongod-x64-win32-8.2.6.exe');
  const db = require('node:child_process').spawn(binary, ['--dbpath', dir, '--replSet', 'audit', '--bind_ip', '127.0.0.1', '--port', String(port)], { windowsHide: true, stdio: 'ignore' });
  const stopped = new Promise(resolve => db.once('close', resolve));
  const direct = new mongoose.mongo.MongoClient('mongodb://127.0.0.1:' + port + '/?directConnection=true', {serverSelectionTimeoutMS: 10000});
  try {
    await direct.connect();
    await direct.db('admin').command({replSetInitiate: {_id:'audit',members:[{_id:0,host:'127.0.0.1:'+port}]}});
    await mongoose.connect('mongodb://127.0.0.1:' + port + '/test?replicaSet=audit', {serverSelectionTimeoutMS:15000});
    const id = () => new mongoose.Types.ObjectId();
    const pharmacyId = id(), medicineId = id();
    await Inventory.create({pharmacyId,medicineId,price:10,stockQuantity:1});
    const reserve = items => new Promise((resolve,reject) => transactional(async(req,res) => {
      await decrementInventory(pharmacyId,items);
      return res.status(200).json({});
    })({}, {status(){return this},json:resolve}, reject));
    const line = {medicineId,quantity:1};
    await assert.rejects(reserve([line,{medicineId:id(),quantity:1}]));
    assert.equal((await Inventory.findOne()).stockQuantity,1);
    const results = await Promise.allSettled([reserve([line]),reserve([line])]);
    assert.equal(results.filter(r => r.status === 'fulfilled').length,1);
    assert.equal((await Inventory.findOne()).stockQuantity,0);
    console.log('PASS: rollback and concurrent last-unit reservation');
  } finally {
    await direct.close();
    await mongoose.disconnect();
    db.kill();
    await stopped;
    fs.rmSync(dir,{recursive:true,force:true});
  }
}
main().catch(err => { console.error(err.message); process.exitCode = 1; });
