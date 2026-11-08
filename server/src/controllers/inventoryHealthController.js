const Medicine = require('../models/Medicine');
const Inventory = require('../models/PharmacyInventory');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');

const STALE_AFTER_HOURS = 24;

function lookupName(from, field, as) {
  return { $lookup: { from, localField: field, foreignField: '_id', pipeline: [{ $project: { name: 1 } }], as } };
}

async function getInventoryHealth(req, res, next) {
  try {
    const { issue = 'missing' } = req.query;
    const page = Number(req.query.page || 1);
    const limit = 25;
    let model = Inventory;
    let stages;
    if (issue === 'missing') {
      model = Medicine;
      stages = [
        { $match: { active: true, isMerged: { $ne: true }, verificationStatus: { $ne: 'MERGED' } } },
        { $lookup: { from: Inventory.collection.name, localField: '_id', foreignField: 'medicineId',
          pipeline: [{ $limit: 1 }, { $project: { _id: 1 } }], as: 'inventory' } },
        { $match: { inventory: { $size: 0 } } },
        { $project: { medicineId: '$_id', medicine: '$name' } }
      ];
    } else if (issue === 'broken' || issue === 'stale') {
      const cutoff = new Date(Date.now() - STALE_AFTER_HOURS * 3600000);
      stages = [];
      if (issue === 'stale') stages.push({ $match: { $or: [
        { lastSyncedAt: { $lt: cutoff } }, { lastSyncedAt: null }
      ] } });
      stages.push(lookupName(Medicine.collection.name, 'medicineId', 'med'),
        lookupName('pharmacies', 'pharmacyId', 'store'));
      if (issue === 'broken') stages.push({ $match: { $or: [{ med: { $size: 0 } }, { store: { $size: 0 } }] } });
      stages.push({ $project: { medicineId: 1, pharmacyId: 1, lastSyncedAt: 1, stockQuantity: 1,
        medicine: { $arrayElemAt: ['$med.name', 0] }, pharmacy: { $arrayElemAt: ['$store.name', 0] } } });
    } else {
      throw ApiError.badRequest('Unknown inventory issue');
    }
    const [result] = await model.aggregate([...stages, { $facet: {
      count: [{ $count: 'total' }],
      rows: [{ $sort: issue === 'stale' ? { lastSyncedAt: 1, _id: 1 } : { medicine: 1, _id: 1 } },
        { $skip: (page - 1) * limit }, { $limit: limit }]
    } }]);
    return ApiResponse.success(res, { rows: result.rows, total: result.count[0]?.total || 0, page, limit,
      staleAfterHours: STALE_AFTER_HOURS });
  } catch (error) { next(error); }
}

module.exports = { getInventoryHealth };
