const mongoose = require('mongoose');
const env = require('../config/env');
const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Medicine = require('../models/Medicine');
const PharmacyInventory = require('../models/PharmacyInventory');
const Prescription = require('../models/Prescription');
const Order = require('../models/Order');
const DeliveryPartner = require('../models/DeliveryPartner');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const Address = require('../models/Address');
const AuditLog = require('../models/AuditLog');
const ResearchSurvey = require('../models/ResearchSurvey');
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);
const connectDB = require('../config/db');
const { medicinesData, pharmaciesData } = require('./seedData');
const generateOrderId = require('../utils/generateOrderId');

const seedDatabase = async (exitOnComplete = true) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connectDB();
    }

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany({}),
      Pharmacy.deleteMany({}),
      Medicine.deleteMany({}),
      PharmacyInventory.deleteMany({}),
      Prescription.deleteMany({}),
      Order.deleteMany({}),
      DeliveryPartner.deleteMany({}),
      Notification.deleteMany({}),
      Review.deleteMany({}),
      Address.deleteMany({}),
      AuditLog.deleteMany({}),
      ResearchSurvey.deleteMany({})
    ]);

    // 1. Create Admin Account (Password: Password@123)
    console.log('[Seed] Creating Administrator...');
    const admin = await User.create({
      name: 'Dr. Alok Verma (Admin)',
      email: 'admin@quickmeds.in',
      phone: '+91 99999 00001',
      password: 'Password@123',
      role: 'ADMIN',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    });

    // 2. Create Customers (Password: Password@123)
    console.log('[Seed] Creating Customers...');
    const customerRahul = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@example.com',
      phone: '9876543210',
      password: 'Password@123',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    });

    const customerPriya = await User.create({
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '9876543211',
      password: 'Password@123',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    });

    const customerAmit = await User.create({
      name: 'Amit Verma',
      email: 'amit@example.com',
      phone: '9876543212',
      password: 'Password@123',
      role: 'CUSTOMER',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    });

    // Saved Addresses for Customers
    const addressHomeRahul = await Address.create({
      userId: customerRahul._id,
      label: 'Home',
      recipientName: 'Rahul Sharma',
      phone: '9876543210',
      street: 'Flat 402, Royal Residency, Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Near Rajiv Chowk Metro Station',
      fullAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi 110001',
      coordinates: [77.214, 28.629],
      isDefault: true
    });

    await Address.create({
      userId: customerRahul._id,
      label: 'Work',
      recipientName: 'Rahul Sharma',
      phone: '9876543210',
      street: 'Tower B, Cyber City, Barakhamba Road',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      landmark: 'Opposite Metro Gate 2',
      fullAddress: 'Tower B, Barakhamba Road, New Delhi 110001',
      coordinates: [77.227, 28.631],
      isDefault: false
    });

    await Address.create({
      userId: customerPriya._id,
      label: 'Home',
      recipientName: 'Priya Patel',
      phone: '9876543211',
      street: '14/2 Arya Samaj Road, Karol Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110005',
      landmark: 'Near Gaffar Market',
      fullAddress: '14/2 Arya Samaj Road, Karol Bagh, New Delhi 110005',
      coordinates: [77.185, 28.644],
      isDefault: true
    });

    await Address.create({
      userId: customerAmit._id,
      label: 'Home',
      recipientName: 'Amit Verma',
      phone: '9876543212',
      street: 'Sector B, Pocket 1, Vasant Kunj',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
      landmark: 'Near Fortis Hospital',
      fullAddress: 'Sector B, Pocket 1, Vasant Kunj, New Delhi 110070',
      coordinates: [77.152, 28.526],
      isDefault: true
    });

    // 3. Create Delivery Partners (Password: Password@123)
    console.log('[Seed] Creating Delivery Fleet...');
    const deliveryUser1 = await User.create({
      name: 'Suresh Kumar',
      email: 'delivery1@quickmeds.in',
      phone: '9810011223',
      password: 'Password@123',
      role: 'DELIVERY_PARTNER',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80'
    });

    const deliveryPartner1 = await DeliveryPartner.create({
      userId: deliveryUser1._id,
      vehicleType: 'Bike',
      vehicleNumber: 'DL-01-AB-4821',
      drivingLicenseNumber: 'DL-0120190048123',
      status: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.215, 28.63]
      },
      completedDeliveriesCount: 142,
      totalEarnings: 5680,
      rating: 4.9
    });
    deliveryUser1.deliveryPartnerId = deliveryPartner1._id;
    await deliveryUser1.save();

    const deliveryUser2 = await User.create({
      name: 'Vikram Singh',
      email: 'delivery2@quickmeds.in',
      phone: '9810011224',
      password: 'Password@123',
      role: 'DELIVERY_PARTNER',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    });

    const deliveryPartner2 = await DeliveryPartner.create({
      userId: deliveryUser2._id,
      vehicleType: 'EV Scooter',
      vehicleNumber: 'DL-04-XY-9012',
      drivingLicenseNumber: 'DL-0420210098452',
      status: 'AVAILABLE',
      currentLocation: {
        type: 'Point',
        coordinates: [77.195, 28.648]
      },
      completedDeliveriesCount: 98,
      totalEarnings: 3920,
      rating: 4.8
    });
    deliveryUser2.deliveryPartnerId = deliveryPartner2._id;
    await deliveryUser2.save();

    // 4. Create Master Medicines
    console.log('[Seed] Seeding Master Medicines catalog...');
    const insertedMedicines = await Medicine.insertMany(medicinesData);
    console.log(`[Seed] Created ${insertedMedicines.length} master medicines.`);

    // 5. Create Pharmacies, Users & Inventory
    console.log('[Seed] Seeding Pharmacies and Inventory...');
    const createdPharmacies = [];

    for (let pIdx = 0; pIdx < pharmaciesData.length; pIdx++) {
      const pData = pharmaciesData[pIdx];
      const pEmail = pData.email;
      const pUser = await User.create({
        name: `${pData.name.split('—')[0].trim()} Manager`,
        email: pEmail,
        phone: pData.phone,
        password: 'Password@123',
        role: 'PHARMACY'
      });

      const pharmacy = await Pharmacy.create({
        ...pData,
        userId: pUser._id
      });

      pUser.pharmacyId = pharmacy._id;
      await pUser.save();

      createdPharmacies.push(pharmacy);

      // Realistic stock inventories:
      // Apollo (pIdx === 0): 100% full inventory on all medicines (single-store match)
      // MedPlus (pIdx === 1): Out of stock on specialized Respiratory/Inhalers and Insulin (triggers split basket)
      // Guardian (pIdx === 2): Out of stock on Pediatric and Women Care
      // Netmeds (pIdx === 3): Out of stock on Cardiac and Inhalers
      // Fortis (pIdx === 4): 100% full emergency inventory
      // Wellness (pIdx === 5): General OTC & Pain stock
      // Max Life (pIdx === 6): Minimal stock
      const inventoryDocs = insertedMedicines.map((med, idx) => {
        let stock = (idx + 1) * 6 + 20; // 26 to 220+ units
        let isAvailable = true;

        if (pIdx === 0 || pIdx === 4) {
          // Apollo & Fortis: 100% full inventory
          stock = 50 + (idx % 10) * 15;
          isAvailable = true;
        } else if (pIdx === 1) {
          // MedPlus: out of stock on Inhalers & Insulin to demonstrate split-basket
          if (med.name.includes('Inhaler') || med.name.includes('Insulin') || med.name.includes('Mixtard')) {
            stock = 0;
            isAvailable = false;
          }
        } else if (pIdx === 2) {
          // Guardian: out of stock on Pediatric
          if (med.category === 'Pediatric' || med.category === 'Women Care') {
            stock = 0;
            isAvailable = false;
          }
        } else if (pIdx === 3) {
          // Netmeds: out of stock on Cardiac & Inhalers
          if (med.category === 'Cardiac' || med.name.includes('Inhaler')) {
            stock = 0;
            isAvailable = false;
          }
        } else if (pIdx === 6) {
          // Max Life (Pending): selective low stock
          stock = idx % 2 === 0 ? 5 : 0;
          isAvailable = stock > 0;
        }

        const discount = (pIdx + idx) % 3 === 0 ? 10 : (pIdx + idx) % 5 === 0 ? 15 : 5;
        const sellingPrice = Math.round(med.mrp * (1 - discount / 100));

        return {
          pharmacyId: pharmacy._id,
          medicineId: med._id,
          stockQuantity: stock,
          lowStockThreshold: 5,
          price: Math.max(5, sellingPrice),
          discountPercentage: discount,
          batchNumber: `BAT-${pharmacy.name.slice(0, 3).toUpperCase()}-${1000 + idx}`,
          expiryDate: new Date(Date.now() + (365 + idx * 30) * 24 * 60 * 60 * 1000),
          isAvailable
        };
      });

      await PharmacyInventory.insertMany(inventoryDocs);
    }

    console.log(`[Seed] Created ${createdPharmacies.length} pharmacies and loaded full inventory.`);

    // 6. Create Prescriptions
    console.log('[Seed] Creating sample Prescriptions...');
    const apolloPharm = createdPharmacies[0];
    const medplusPharm = createdPharmacies[1];
    const fortisPharm = createdPharmacies[4];

    const prescriptionApproved = await Prescription.create({
      customerId: customerRahul._id,
      pharmacyId: apolloPharm._id,
      fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      originalName: 'Rx_Dr_Verma_Fever_Consultation.pdf',
      mimeType: 'application/pdf',
      fileSize: 1048576,
      status: 'APPROVED',
      patientName: 'Rahul Sharma',
      doctorName: 'Dr. S. K. Gupta, MD (Internal Medicine)',
      customerNotes: 'Urgent delivery needed for high fever.',
      reviewedBy: apolloPharm.userId,
      reviewNotes: 'Prescription valid. Dosage and Schedule H1 protocol verified for Augmentin 625 & Combiflam.',
      reviewedAt: new Date(Date.now() - 3600000 * 4)
    });

    const prescriptionUnderReview = await Prescription.create({
      customerId: customerPriya._id,
      pharmacyId: medplusPharm._id,
      fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      originalName: 'Prescription_PanD_Refill.jpg',
      mimeType: 'image/jpeg',
      fileSize: 734003,
      status: 'UNDER_REVIEW',
      patientName: 'Priya Patel',
      doctorName: 'Dr. Meenakshi Rao, MD (Gastroenterology)',
      customerNotes: 'Refill requested for acute GERD symptoms.'
    });

    const prescriptionRejected = await Prescription.create({
      customerId: customerAmit._id,
      pharmacyId: fortisPharm._id,
      fileUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80',
      originalName: 'Old_Rx_Asthma.pdf',
      mimeType: 'application/pdf',
      fileSize: 512000,
      status: 'REJECTED',
      patientName: 'Amit Verma',
      doctorName: 'Dr. K. L. Sharma, Pulmonologist',
      customerNotes: 'Inhaler repeat prescription.',
      reviewedBy: fortisPharm.userId,
      rejectionReason: 'Prescription date exceeds 6 months validity limit. Please consult your physician for a fresh prescription.',
      reviewNotes: 'Expired prescription. Cannot dispense Schedule H bronchodilator.',
      reviewedAt: new Date(Date.now() - 3600000 * 12)
    });

    // 7. Create Sample Orders across lifecycles
    console.log('[Seed] Creating sample Orders in various lifecycle states...');

    const doloMed = insertedMedicines.find((m) => m.name.includes('Dolo'));
    const benadrylMed = insertedMedicines.find((m) => m.name.includes('Benadryl'));
    const augmentinMed = insertedMedicines.find((m) => m.name.includes('Augmentin'));
    const combiflamMed = insertedMedicines.find((m) => m.name.includes('Combiflam'));
    const panDMed = insertedMedicines.find((m) => m.name.includes('Pan-D'));
    const digeneMed = insertedMedicines.find((m) => m.name.includes('Digene'));
    const asthalinMed = insertedMedicines.find((m) => m.name.includes('Asthalin'));
    const telmaMed = insertedMedicines.find((m) => m.name.includes('Telma'));
    const electralMed = insertedMedicines.find((m) => m.name.includes('Electral'));
    const betadineMed = insertedMedicines.find((m) => m.name.includes('Betadine'));

    // Order 1: DELIVERED (Rahul)
    const orderDelivered = await Order.create({
      orderId: generateOrderId(),
      customerId: customerRahul._id,
      pharmacyId: apolloPharm._id,
      deliveryPartnerId: deliveryUser1._id,
      items: [
        {
          medicineId: doloMed._id,
          name: doloMed.name,
          strength: doloMed.strength,
          dosageForm: doloMed.dosageForm,
          image: doloMed.image,
          price: 32,
          quantity: 2,
          requiresPrescription: false
        },
        {
          medicineId: benadrylMed._id,
          name: benadrylMed.name,
          strength: benadrylMed.strength,
          dosageForm: benadrylMed.dosageForm,
          image: benadrylMed.image,
          price: 135,
          quantity: 1,
          requiresPrescription: false
        }
      ],
      subtotal: 199,
      deliveryFee: 25,
      total: 224,
      deliveryAddress: {
        label: 'Home',
        street: 'Flat 402, Royal Residency, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi 110001',
        coordinates: [77.214, 28.629]
      },
      paymentMethod: 'COD',
      paymentStatus: 'PAID',
      orderStatus: 'DELIVERED',
      distanceKm: 1.8,
      estimatedDeliveryMinutes: 18,
      isReviewed: true,
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 3600000 * 5), note: 'Order placed by customer' },
        { status: 'ACCEPTED', timestamp: new Date(Date.now() - 3600000 * 4.8), note: 'Accepted by Apollo Pharmacy' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 3600000 * 4.5), note: 'Medicines verified and packed' },
        { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 3600000 * 4.2), note: 'Order sealed with tamper-proof badge' },
        { status: 'DELIVERY_ASSIGNED', timestamp: new Date(Date.now() - 3600000 * 4.1), note: 'Assigned to Suresh Kumar (DL-01-AB-4821)' },
        { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 3600000 * 3.8), note: 'Rider en route to delivery location' },
        { status: 'DELIVERED', timestamp: new Date(Date.now() - 3600000 * 3.5), note: 'Delivered in 18 minutes. OTP verified.' }
      ]
    });

    await Review.create({
      customerId: customerRahul._id,
      pharmacyId: apolloPharm._id,
      orderId: orderDelivered._id,
      rating: 5,
      comment: 'Super fast delivery! Got emergency fever medicines in 18 minutes in perfect condition.',
      deliveryRating: 5,
      deliveryComment: 'Very polite delivery executive with thermal medicine bag.'
    });

    // Order 2: OUT_FOR_DELIVERY (Rahul - Live tracking test order)
    const orderOutForDelivery = await Order.create({
      orderId: generateOrderId(),
      customerId: customerRahul._id,
      pharmacyId: apolloPharm._id,
      deliveryPartnerId: deliveryUser1._id,
      prescriptionId: prescriptionApproved._id,
      prescriptionStatus: 'APPROVED',
      items: [
        {
          medicineId: augmentinMed._id,
          name: augmentinMed.name,
          strength: augmentinMed.strength,
          dosageForm: augmentinMed.dosageForm,
          image: augmentinMed.image,
          price: 185,
          quantity: 1,
          requiresPrescription: true
        },
        {
          medicineId: combiflamMed._id,
          name: combiflamMed.name,
          strength: combiflamMed.strength,
          dosageForm: combiflamMed.dosageForm,
          image: combiflamMed.image,
          price: 42,
          quantity: 1,
          requiresPrescription: true
        }
      ],
      subtotal: 227,
      deliveryFee: 25,
      total: 252,
      deliveryAddress: {
        label: 'Home',
        street: 'Flat 402, Royal Residency, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi 110001',
        coordinates: [77.214, 28.629]
      },
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'OUT_FOR_DELIVERY',
      distanceKm: 2.1,
      estimatedDeliveryMinutes: 15,
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 1800000), note: 'Order placed with digital prescription' },
        { status: 'ACCEPTED', timestamp: new Date(Date.now() - 1500000), note: 'Prescription verified by pharmacist and order confirmed' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 1200000), note: 'Packing medicines with tamper-proof security seal' },
        { status: 'READY_FOR_PICKUP', timestamp: new Date(Date.now() - 800000), note: 'Ready for rider dispatch' },
        { status: 'DELIVERY_ASSIGNED', timestamp: new Date(Date.now() - 700000), note: 'Assigned to Suresh Kumar (DL-01-AB-4821)' },
        { status: 'OUT_FOR_DELIVERY', timestamp: new Date(Date.now() - 300000), note: 'Rider is 1.2 km away from doorstep' }
      ]
    });

    deliveryPartner1.activeOrderId = orderOutForDelivery._id;
    deliveryPartner1.status = 'BUSY';
    await deliveryPartner1.save();

    // Order 3: PREPARING (Priya)
    await Order.create({
      orderId: generateOrderId(),
      customerId: customerPriya._id,
      pharmacyId: medplusPharm._id,
      items: [
        {
          medicineId: panDMed._id,
          name: panDMed.name,
          strength: panDMed.strength,
          dosageForm: panDMed.dosageForm,
          image: panDMed.image,
          price: 180,
          quantity: 1,
          requiresPrescription: true
        },
        {
          medicineId: digeneMed._id,
          name: digeneMed.name,
          strength: digeneMed.strength,
          dosageForm: digeneMed.dosageForm,
          image: digeneMed.image,
          price: 155,
          quantity: 1,
          requiresPrescription: false
        }
      ],
      subtotal: 335,
      deliveryFee: 25,
      total: 360,
      deliveryAddress: {
        label: 'Home',
        street: '14/2 Arya Samaj Road, Karol Bagh',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110005',
        fullAddress: '14/2 Arya Samaj Road, Karol Bagh, New Delhi 110005',
        coordinates: [77.185, 28.644]
      },
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PREPARING',
      distanceKm: 1.2,
      estimatedDeliveryMinutes: 20,
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 900000), note: 'Order placed' },
        { status: 'ACCEPTED', timestamp: new Date(Date.now() - 600000), note: 'Accepted by MedPlus Chemist' },
        { status: 'PREPARING', timestamp: new Date(Date.now() - 300000), note: 'Packaging medicines in tamper-evident pouch' }
      ]
    });

    // Order 4: PHARMACY_REVIEW (Amit)
    await Order.create({
      orderId: generateOrderId(),
      customerId: customerAmit._id,
      pharmacyId: fortisPharm._id,
      items: [
        {
          medicineId: asthalinMed._id,
          name: asthalinMed.name,
          strength: asthalinMed.strength,
          dosageForm: asthalinMed.dosageForm,
          image: asthalinMed.image,
          price: 150,
          quantity: 1,
          requiresPrescription: true
        },
        {
          medicineId: telmaMed._id,
          name: telmaMed.name,
          strength: telmaMed.strength,
          dosageForm: telmaMed.dosageForm,
          image: telmaMed.image,
          price: 195,
          quantity: 1,
          requiresPrescription: true
        }
      ],
      subtotal: 345,
      deliveryFee: 25,
      total: 370,
      deliveryAddress: {
        label: 'Home',
        street: 'Sector B, Pocket 1, Vasant Kunj',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110070',
        fullAddress: 'Sector B, Pocket 1, Vasant Kunj, New Delhi 110070',
        coordinates: [77.152, 28.526]
      },
      paymentMethod: 'ONLINE',
      paymentStatus: 'PAID',
      orderStatus: 'PHARMACY_REVIEW',
      distanceKm: 1.5,
      estimatedDeliveryMinutes: 22,
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 300000), note: 'Emergency order placed. Awaiting pharmacist prescription verification.' }
      ]
    });

    // Order 5: PLACED (Rahul - First Aid Essentials)
    await Order.create({
      orderId: generateOrderId(),
      customerId: customerRahul._id,
      pharmacyId: apolloPharm._id,
      items: [
        {
          medicineId: electralMed._id,
          name: electralMed.name,
          strength: electralMed.strength,
          dosageForm: electralMed.dosageForm,
          image: electralMed.image,
          price: 22,
          quantity: 3,
          requiresPrescription: false
        },
        {
          medicineId: betadineMed._id,
          name: betadineMed.name,
          strength: betadineMed.strength,
          dosageForm: betadineMed.dosageForm,
          image: betadineMed.image,
          price: 110,
          quantity: 1,
          requiresPrescription: false
        }
      ],
      subtotal: 176,
      deliveryFee: 25,
      total: 201,
      deliveryAddress: {
        label: 'Home',
        street: 'Flat 402, Royal Residency, Connaught Place',
        city: 'New Delhi',
        state: 'Delhi',
        pincode: '110001',
        fullAddress: 'Flat 402, Royal Residency, Connaught Place, New Delhi 110001',
        coordinates: [77.214, 28.629]
      },
      paymentMethod: 'COD',
      paymentStatus: 'PENDING',
      orderStatus: 'PLACED',
      distanceKm: 1.8,
      estimatedDeliveryMinutes: 20,
      statusHistory: [
        { status: 'PLACED', timestamp: new Date(Date.now() - 120000), note: 'Order placed by customer' }
      ]
    });

    // 8. Create Notifications
    console.log('[Seed] Creating sample Notifications...');
    await Notification.create([
      {
        userId: customerRahul._id,
        type: 'OUT_FOR_DELIVERY',
        title: 'Medicines Out for Delivery! 🛵',
        message: 'Suresh Kumar is en route with your emergency medicines.',
        link: `/orders/${orderOutForDelivery._id}`
      },
      {
        userId: customerRahul._id,
        type: 'PRESCRIPTION_APPROVED',
        title: 'Prescription Verified ✅',
        message: 'Your prescription for Augmentin 625 & Combiflam has been approved by the licensed pharmacist.',
        link: `/prescriptions/${prescriptionApproved._id}`
      },
      {
        userId: apolloPharm.userId,
        type: 'ORDER_PLACED',
        title: 'New Emergency Order Received',
        message: 'Order received from Rahul Sharma for ₹252.',
        link: `/pharmacy/orders/${orderOutForDelivery._id}`
      },
      {
        userId: customerAmit._id,
        type: 'PRESCRIPTION_REJECTED',
        title: 'Prescription Verification Notice',
        message: 'Your uploaded prescription could not be validated. Reason: Expired validity.',
        link: `/prescriptions/${prescriptionRejected._id}`
      }
    ]);

    // 9. Create System Audit Logs
    console.log('[Seed] Creating system Audit Logs...');
    await AuditLog.create([
      {
        actorId: admin._id,
        actorRole: 'ADMIN',
        action: 'PHARMACY_VERIFIED',
        entity: 'PHARMACY',
        entityId: apolloPharm._id.toString(),
        description: 'Admin verified drug retail license DL-ND-2023-99881 for Apollo Pharmacy (Connaught Place).'
      },
      {
        actorId: admin._id,
        actorRole: 'ADMIN',
        action: 'PHARMACY_VERIFIED',
        entity: 'PHARMACY',
        entityId: fortisPharm._id.toString(),
        description: 'Admin verified drug retail license DL-SW-2023-88771 for Fortis Health Pharmacy (Vasant Kunj).'
      },
      {
        actorId: apolloPharm.userId,
        actorRole: 'PHARMACY',
        action: 'PRESCRIPTION_APPROVED',
        entity: 'PRESCRIPTION',
        entityId: prescriptionApproved._id.toString(),
        description: 'Pharmacist approved prescription for Rahul Sharma (Augmentin 625 + Combiflam).'
      },
      {
        actorId: admin._id,
        actorRole: 'ADMIN',
        action: 'ROUTING_FALLBACK',
        entity: 'ORDER',
        entityId: orderDelivered._id.toString(),
        description: 'Smart routing engine evaluated 6 candidate pharmacies and selected optimal single-store fulfilment.'
      },
      {
        actorId: admin._id,
        actorRole: 'ADMIN',
        action: 'SYSTEM_BOOTSTRAP',
        entity: 'SYSTEM',
        description: 'Platform initialized with QuickMeds master seed data.'
      }
    ]);

    // 10. Pre-seed Research Survey Benchmarks
    console.log('[Seed] Seeding Research Survey benchmarks...');
    await ResearchSurvey.create({
      title: 'Hyperlocal Emergency Medicine Accessibility & Stock-Out Field Study',
      subtitle: 'Empirical survey across 1,605 patients and 185 independent retail pharmacies in Delhi NCR & Tier-1 Urban Clusters',
      totalRespondents: 1605,
      patientSampleSize: 1420,
      pharmacySampleSize: 185,
      avgOfflineSearchTimeMins: 64.5,
      avgQuickMedsEtaMins: 18.8,
      emergencyStockOutRatePercent: 41.8,
      prescriptionVerificationSpeedMins: 3.2,
      patientSatisfactionRate: 94.6,
      pharmacyOnboardingRate: 88.2,
      accessTimeByDistance: [
        { distanceRange: '0 - 2 km (Hyperlocal Core)', quickmedsTime: 14, offlineTime: 42, urgencyWeight: 85 },
        { distanceRange: '2 - 5 km (Neighbourhood Sector)', quickmedsTime: 21, offlineTime: 68, urgencyWeight: 72 },
        { distanceRange: '5 - 8 km (Extended Suburb)', quickmedsTime: 29, offlineTime: 95, urgencyWeight: 58 },
        { distanceRange: '8 - 12 km (Outlying Periphery)', quickmedsTime: 38, offlineTime: 135, urgencyWeight: 44 }
      ],
      pharmacyDensityVsStockOut: [
        { areaType: 'Dense Urban Hub (Connaught Place/Karol Bagh)', pharmaciesPerSqKm: 14.2, stockOutRate: 22.4, avgEtaMins: 14.5 },
        { areaType: 'Residential Sector (Rohini/Dwarka/Noida)', pharmaciesPerSqKm: 6.8, stockOutRate: 38.6, avgEtaMins: 21.2 },
        { areaType: 'Semi-Urban Suburb (Outer Ring Road/Najafgarh)', pharmaciesPerSqKm: 2.1, stockOutRate: 59.4, avgEtaMins: 36.8 },
        { areaType: 'Night Shift Zone (11 PM - 6 AM All Sectors)', pharmaciesPerSqKm: 0.9, stockOutRate: 74.2, avgEtaMins: 48.0 }
      ],
      painPointsBreakdown: [
        { issue: 'Offline stock-outs during nocturnal/weekend emergencies', percentage: 72.4, severity: 'CRITICAL' },
        { issue: 'Lack of verified generic substitute availability', percentage: 61.8, severity: 'HIGH' },
        { issue: 'Prescription rejection delay without reason at counter', percentage: 48.5, severity: 'MEDIUM' },
        { issue: 'Excessive transit time (>45 mins) to find 24x7 chemist', percentage: 68.2, severity: 'CRITICAL' },
        { issue: 'Multiple chemist visits needed to fulfill full prescription basket', percentage: 54.9, severity: 'HIGH' }
      ],
      pharmacyAdoptionMetrics: [
        { label: 'Independent Chemists Willing to Digitize Inventory', value: '84.2%' },
        { label: 'Reported Dead-Stock Expiry Reduction with QuickMeds', value: '31.5%' },
        { label: 'Incremental Night Order Revenue per Retailer', value: '+26.8%' },
        { label: 'Average Pharmacist Prescription Sign-off Time', value: '3.1 Mins' }
      ],
      notes: 'Benchmark dataset compiled across urban retail pharmacy networks. Metrics are dynamically manageable in the Admin portal.',
      lastUpdated: new Date()
    });

    console.log('\n=============================================================');
    console.log('  🎉 QUICKMEDS DATABASE SEEDED SUCCESSFULLY!');
    console.log('=============================================================');
    console.log('  TEST ACCOUNTS (Password: Password@123 for all accounts):');
    console.log('  -----------------------------------------------------------');
    console.log('  👑 ADMIN:              admin@quickmeds.in       / Password@123');
    console.log('  👤 CUSTOMER 1 (Rahul): rahul@example.com        / Password@123');
    console.log('  👤 CUSTOMER 2 (Priya): priya@example.com        / Password@123');
    console.log('  👤 CUSTOMER 3 (Amit):  amit@example.com         / Password@123');
    console.log('  🏥 PHARMACY (Apollo):  apollo@pharmacy.in       / Password@123');
    console.log('  🏥 PHARMACY (MedPlus): medplus@pharmacy.in      / Password@123');
    console.log('  🏥 PHARMACY (Guardian):guardian@pharmacy.in     / Password@123');
    console.log('  🏥 PHARMACY (Netmeds): netmeds@pharmacy.in      / Password@123');
    console.log('  🏥 PHARMACY (Fortis):  fortis@pharmacy.in       / Password@123');
    console.log('  🏥 PHARMACY (Wellness):wellness@pharmacy.in     / Password@123');
    console.log('  🛵 DELIVERY 1 (Bike):  delivery1@quickmeds.in   / Password@123');
    console.log('=============================================================\n');
    console.log('[Seed] Database successfully seeded with 33 medicines, 7 pharmacies, and demo users.');

    if (exitOnComplete) {
      process.exit(0);
    }
    return true;
  } catch (error) {
    console.error('[Seed] Error seeding database:', error);
    if (exitOnComplete) {
      process.exit(1);
    }
    throw error;
  }
};

if (require.main === module) {
  seedDatabase(true);
}

module.exports = seedDatabase;
