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
    // Exclude demo orders from production analytics
    Order.countDocuments({ isDemo: { $ne: true } }),
    Order.countDocuments({ orderStatus: 'DELIVERED', isDemo: { $ne: true } }),
    Order.countDocuments({ orderStatus: 'CANCELLED', isDemo: { $ne: true } }),
    Prescription.countDocuments({ status: 'UNDER_REVIEW' }),
    Order.aggregate([
      { $match: { orderStatus: 'DELIVERED', isDemo: { $ne: true } } },
      { $group: { _id: null, totalRevenue: { $sum: '$total' }, avgOrderValue: { $avg: '$total' } } }
    ])
  ]);

  const totalRevenue = revenueData[0] ? Math.round(revenueData[0].totalRevenue) : 0;
  const avgOrderValue = revenueData[0] ? Math.round(revenueData[0].avgOrderValue) : 0;

  // Recent 7 days order volume trend (excluding demo)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const orderTrends = await Order.aggregate([
    { $match: { createdAt: { $gte: sevenDaysAgo }, isDemo: { $ne: true } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
        revenue: { $sum: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  // Order status breakdown (excluding demo)
  const statusDistribution = await Order.aggregate([
    { $match: { isDemo: { $ne: true } } },
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
