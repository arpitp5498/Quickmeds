const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Order = require('../models/Order');
const Prescription = require('../models/Prescription');
const DeliveryPartner = require('../models/DeliveryPartner');

const getDashboardStats = async () => {
  const [
    totalUsers,
    totalCustomers,
    totalPharmacies,
    verifiedPharmacies,
    pendingPharmacies,
    totalDeliveryPartners,
    totalOrders,
    completedOrders,
    cancelledOrders,
    pendingPrescriptions,
    revenueData
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ role: 'CUSTOMER' }),
    Pharmacy.countDocuments(),
    Pharmacy.countDocuments({ verificationStatus: 'VERIFIED' }),
    Pharmacy.countDocuments({ verificationStatus: 'PENDING' }),
    DeliveryPartner.countDocuments(),
    Order.countDocuments(),
    Order.countDocuments({ orderStatus: 'DELIVERED' }),
    Order.countDocuments({ orderStatus: 'CANCELLED' }),
    Prescription.countDocuments({ status: 'UNDER_REVIEW' }),
    Order.aggregate([
      { $match: { orderStatus: 'DELIVERED' } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } }
    ])
  ]);

  const totalRevenue = revenueData[0] ? Math.round(revenueData[0].totalRevenue) : 0;
  const avgOrderValue = revenueData[0] ? Math.round(revenueData[0].avgOrderValue) : 0;

  // Recent 7 days order volume trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const orderTrends = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Order status breakdown
  const statusDistribution = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  return {
    metrics: {
      totalUsers,
      totalCustomers,
      totalPharmacies,
      verifiedPharmacies,
      pendingPharmacies,
      totalDeliveryPartners,
      totalOrders,
      completedOrders,
      cancelledOrders,
      pendingPrescriptions,
      totalRevenue,
      avgOrderValue
    },
    orderTrends,
    statusDistribution
  };
};

module.exports = {
  getDashboardStats
};
