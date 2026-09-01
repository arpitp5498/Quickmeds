const XLSX = require('xlsx');
const mongoose = require('mongoose');
const {
  calculateSimilarity,
  matchWithMasterCatalog,
  syncSingleItem,
  bulkSyncInventory,
  parseAndMatchSpreadsheet,
  parseInvoiceOCR,
  processBillingWebhook,
  simulateBillingSale
} = require('../src/services/inventorySyncService');
const Medicine = require('../src/models/Medicine');
const Pharmacy = require('../src/models/Pharmacy');
const PharmacyInventory = require('../src/models/PharmacyInventory');
const BillingIntegration = require('../src/models/BillingIntegration');
const WebhookEvent = require('../src/models/WebhookEvent');
const InventoryActivity = require('../src/models/InventoryActivity');
const User = require('../src/models/User');

const connectDB = require('../src/config/db');

jest.setTimeout(30000);

describe('Pharmacy Inventory Ecosystem & Sync Service Tests', () => {
  let testPharmacy;
  let testUser;
  let testMedicine;

  beforeAll(async () => {
    await connectDB();

    // Create test medicine if not exists
    testMedicine = await Medicine.findOne({ name: 'Dolo 650mg Tablet' });
    if (!testMedicine) {
      testMedicine = await Medicine.create({
        name: 'Dolo 650mg Tablet',
        genericName: 'Paracetamol 650mg',
        brand: 'Micro Labs Ltd',
        manufacturer: 'Micro Labs',
        strength: '650mg',
        dosageForm: 'Tablet',
        category: 'Fever & Pain',
        mrp: 31,
        description: 'Paracetamol 650mg analgesic and antipyretic'
      });
    }

    // Create test user and pharmacy
    testUser = await User.findOne({ email: 'test_pharmacy_owner@quickmeds.in' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Test Pharmacist',
        email: 'test_pharmacy_owner@quickmeds.in',
        phone: '9876543210',
        password: 'Password@123',
        role: 'PHARMACY'
      });
    }

    testPharmacy = await Pharmacy.findOne({ licenseNumber: 'TEST-DL-INV-9999' });
    if (!testPharmacy) {
      testPharmacy = await Pharmacy.create({
        userId: testUser._id,
        name: 'Test City Meds',
        phone: '9876543210',
        email: 'test_pharmacy_owner@quickmeds.in',
        address: {
          street: 'Connaught Place',
          city: 'New Delhi',
          state: 'Delhi',
          pincode: '110001',
          fullAddress: 'Connaught Place, New Delhi 110001'
        },
        location: {
          type: 'Point',
          coordinates: [77.219, 28.632]
        },
        licenseNumber: 'TEST-DL-INV-9999',
        verificationStatus: 'VERIFIED',
        isOpen: true
      });
    }
  });

  afterAll(async () => {
    // Clean up test data
    if (testPharmacy) {
      await PharmacyInventory.deleteMany({ pharmacyId: testPharmacy._id });
      await BillingIntegration.deleteMany({ pharmacyId: testPharmacy._id });
      await WebhookEvent.deleteMany({ pharmacyId: testPharmacy._id });
      await InventoryActivity.deleteMany({ pharmacyId: testPharmacy._id });
    }
  });

  describe('1. Fuzzy Similarity & Catalog Matching', () => {
    test('calculateSimilarity returns high score for identical strings', () => {
      const score = calculateSimilarity('Paracetamol 650mg', 'Paracetamol 650mg');
      expect(score).toBe(1.0);
    });

    test('calculateSimilarity returns good score for slight variations', () => {
      const score = calculateSimilarity('Dolo 650 Tablet', 'Dolo 650mg Tablet');
      expect(score).toBeGreaterThan(0.7);
    });

    test('matchWithMasterCatalog matches exact and fuzzy medicine names', async () => {
      const match = await matchWithMasterCatalog('Dolo 650mg');
      expect(match.status).toBe('MATCHED');
      expect(match.matchedMedicine).toBeDefined();
      expect(match.confidence).toBeGreaterThanOrEqual(80);
    });
  });

  describe('2. Single Item Synchronization & Activity Audit', () => {
    test('syncSingleItem successfully adds medicine and creates InventoryActivity', async () => {
      const item = await syncSingleItem({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id,
        quantity: 50,
        price: 31,
        batchNumber: 'TEST-BAT-001',
        source: 'MANUAL',
        operationType: 'SET',
        userId: testUser._id,
        description: 'Initial test stocking'
      });

      expect(item).toBeDefined();
      expect(item.stockQuantity).toBe(50);
      expect(item.source).toBe('MANUAL');

      // Verify audit activity
      const activity = await InventoryActivity.findOne({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id
      }).sort({ createdAt: -1 });

      expect(activity).toBeDefined();
      expect(activity.newStock).toBe(50);
      expect(activity.source).toBe('MANUAL');
    });

    test('syncSingleItem DEDUCT correctly decrements stock', async () => {
      const item = await syncSingleItem({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id,
        quantity: 10,
        source: 'BILLING_SYNC',
        operationType: 'DEDUCT',
        userId: testUser._id
      });

      expect(item.stockQuantity).toBe(40); // 50 - 10 = 40
    });
  });

  describe('3. Bulk Spreadsheet Parser & Import', () => {
    test('parseAndMatchSpreadsheet parses buffer and matches columns', async () => {
      // Build in-memory workbook
      const wsData = [
        ['Product Name', 'Composition', 'Qty', 'MRP', 'Batch No', 'Exp Date'],
        ['Dolo 650mg Tablet', 'Paracetamol', 100, 31, 'BAT-DOLO-99', '2027-12-31'],
        ['Crocin 500 Advance', 'Paracetamol', 50, 28, 'BAT-CROC-88', '2027-10-31']
      ];
      const ws = XLSX.utils.aoa_to_sheet(wsData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

      const result = await parseAndMatchSpreadsheet(buffer, 'test_inventory.xlsx');

      expect(result.totalRows).toBe(2);
      expect(result.matchedCount).toBeGreaterThanOrEqual(1);
      expect(result.rows[0].rawName).toBe('Dolo 650mg Tablet');
      expect(result.rows[0].matchStatus).toBe('MATCHED');
    });

    test('bulkSyncInventory updates stock for multiple medicines', async () => {
      const itemsToSync = [
        {
          medicineId: testMedicine._id,
          quantity: 25,
          price: 31,
          batchNumber: 'BULK-BAT-01',
          operationType: 'ADD'
        }
      ];

      const bulkResult = await bulkSyncInventory({
        pharmacyId: testPharmacy._id,
        items: itemsToSync,
        source: 'CSV_IMPORT',
        userId: testUser._id,
        referenceId: 'TEST-CSV-001'
      });

      expect(bulkResult.totalProcessed).toBe(1);
      expect(bulkResult.successCount).toBe(1);

      const inv = await PharmacyInventory.findOne({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id
      });
      expect(inv.stockQuantity).toBe(65); // 40 + 25 = 65
      expect(inv.source).toBe('CSV_IMPORT');
    });
  });

  describe('4. Purchase Invoice OCR Extraction', () => {
    test('parseInvoiceOCR extracts invoice line items with confidence rating', async () => {
      const dummyBuffer = Buffer.from('mock_invoice_content');
      const ocrResult = await parseInvoiceOCR(dummyBuffer, 'image/png', 'sample_invoice.png');

      expect(ocrResult.invoiceNumber).toBeDefined();
      expect(ocrResult.extractedItems.length).toBeGreaterThan(0);
      expect(ocrResult.overallConfidence).toBeGreaterThanOrEqual(90);
      expect(ocrResult.extractedItems[0].confidence).toBeGreaterThan(80);
    });
  });

  describe('5. Billing Webhook & Idempotency', () => {
    test('processBillingWebhook updates stock and enforces idempotency', async () => {
      // Create billing integration
      const merchantId = `TEST-MERCHANT-${Date.now()}`;
      await BillingIntegration.create({
        pharmacyId: testPharmacy._id,
        provider: 'Marg ERP 9+',
        merchantId,
        apiKey: 'qm_live_test_api_key_12345',
        webhookSecret: 'whsec_test_secret_67890',
        status: 'CONNECTED'
      });

      const eventId = `EVT-TEST-${Date.now()}`;
      const payload = {
        event: 'inventory.sold',
        merchantId,
        eventId,
        items: [
          {
            medicineId: testMedicine._id.toString(),
            quantity: 5
          }
        ]
      };

      // 1st request: Process webhook
      const firstRes = await processBillingWebhook({
        headers: { 'x-merchant-id': merchantId },
        body: payload
      });

      expect(firstRes.success).toBe(true);
      expect(firstRes.status).toBe('PROCESSED');

      const invAfterFirst = await PharmacyInventory.findOne({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id
      });
      expect(invAfterFirst.stockQuantity).toBe(60); // 65 - 5 = 60

      // 2nd request (duplicate eventId): Must NOT deduct stock again!
      const duplicateRes = await processBillingWebhook({
        headers: { 'x-merchant-id': merchantId },
        body: payload
      });

      expect(duplicateRes.success).toBe(true);
      expect(duplicateRes.status).toBe('DUPLICATE');

      const invAfterSecond = await PharmacyInventory.findOne({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id
      });
      expect(invAfterSecond.stockQuantity).toBe(60); // Stock remains 60, not 55!
    });
  });

  describe('6. Demo POS Sale Simulator', () => {
    test('simulateBillingSale decrements stock and logs BILLING_SALE activity', async () => {
      const inv = await PharmacyInventory.findOne({
        pharmacyId: testPharmacy._id,
        medicineId: testMedicine._id
      });

      const simResult = await simulateBillingSale({
        pharmacyId: testPharmacy._id,
        inventoryId: inv._id,
        quantitySold: 2,
        userId: testUser._id
      });

      expect(simResult.previousStock).toBe(60);
      expect(simResult.newStock).toBe(58);
      expect(simResult.quantitySold).toBe(2);
      expect(simResult.source).toBe('BILLING_SYNC');
    });
  });
});
