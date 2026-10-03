/**
 * QuickMeds — Development & Staging Healthcare Test Data Seed Script
 * 
 * IMPORTANT SAFETY CONSTRAINTS:
 * 1. Strict environment guard: Blocks execution in production (NODE_ENV === 'production' or VERCEL).
 * 2. Requires explicit ALLOW_TEST_DATA_SEED=true environment confirmation.
 * 3. Idempotent: Can be run multiple times safely without creating duplicates.
 * 4. Explicit test marker: Every seeded record has `isTestData: true`.
 * 5. Safe cleanup: seed:healthcare:clear deletes ONLY records with `isTestData: true`.
 * 6. Preserves all existing real data and pharmacy catalogs untouched.
 */

require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const connectDB = require('../config/db');

const Doctor = require('../models/Doctor');
const LabTest = require('../models/LabTest');
const User = require('../models/User');
const LabBooking = require('../models/LabBooking');
const Consultation = require('../models/Consultation');

// ==========================================
// 1. PRODUCTION & ENVIRONMENT SAFETY GUARDS
// ==========================================
const verifyEnvironmentSafety = () => {
  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.VERCEL) ||
    Boolean(process.env.AWS_EXECUTION_ENV);

  if (isProduction) {
    console.error('\n❌ [SAFETY ABORT] Refusing to seed test healthcare data in PRODUCTION!');
    console.error('QuickMeds is a real production-oriented healthcare platform.');
    console.error('Fictional test practitioners and laboratories must NEVER be seeded to production.\n');
    process.exit(1);
  }

  if (process.env.ALLOW_TEST_DATA_SEED !== 'true') {
    console.error('\n❌ [SAFETY ABORT] Missing explicit confirmation flag: ALLOW_TEST_DATA_SEED=true');
    console.error('To run safely in development/staging, use:');
    console.error('  npm run seed:healthcare\n');
    process.exit(1);
  }

  // Sanity check database URI
  const rawUri = env.MONGO_URI || process.env.MONGODB_URI || '';
  if (rawUri.toLowerCase().includes('prod') && !rawUri.toLowerCase().includes('staging')) {
    console.warn('\n⚠️ [SAFETY WARNING] Database URI contains "prod" string. Proceeding only because NODE_ENV !== "production".');
  }
};

// ==========================================
// 2. FICTIONAL TEST DOCTORS DATA (14 DOCTORS)
// ==========================================
// All credentials, registration numbers, contact numbers and addresses are strictly fictional.
const testDoctorsData = [
  {
    name: 'Dr. Aarav Mehta (Test)',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD (General Medicine)',
    registrationNumber: 'TEST-MED-10101',
    fee: 450,
    phone: '+91 99999 00101',
    email: 'test.dr.aarav@quickmeds-staging.local',
    experience: 12,
    rating: 4.8,
    isAvailable: true,
    languages: ['Hindi', 'English'],
    about: 'Experienced internal medicine practitioner specializing in adult primary care, hypertension, fever management, and lifestyle diseases. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '09:00', endTime: '13:00' },
      { day: 'Wednesday', startTime: '14:00', endTime: '18:00' },
      { day: 'Friday', startTime: '10:00', endTime: '14:00' }
    ],
    clinicAddress: {
      street: 'Staging MediCenter, Block B',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110001',
      coordinates: [77.209, 28.6139]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Neha Sharma (Test)',
    specialty: 'Dermatology',
    qualification: 'MBBS, MD (DVL), FAAD',
    registrationNumber: 'TEST-DERM-10102',
    fee: 650,
    phone: '+91 99999 00102',
    email: 'test.dr.neha@quickmeds-staging.local',
    experience: 9,
    rating: 4.9,
    isAvailable: true,
    languages: ['English', 'Hindi', 'Punjabi'],
    about: 'Consultant dermatologist focusing on clinical dermatology, acne therapies, allergic dermatitis, and pediatric skin conditions. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Thursday', startTime: '15:00', endTime: '19:00' },
      { day: 'Saturday', startTime: '11:00', endTime: '16:00' }
    ],
    clinicAddress: {
      street: 'Skin & Allergy Testing Clinic, Sector 14',
      city: 'Gurugram',
      state: 'Haryana',
      pincode: '122001',
      coordinates: [77.038, 28.4595]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Rohan Kapoor (Test)',
    specialty: 'Pediatrics',
    qualification: 'MBBS, DCH, DNB (Pediatrics)',
    registrationNumber: 'TEST-PED-10103',
    fee: 500,
    phone: '+91 99999 00103',
    email: 'test.dr.rohan@quickmeds-staging.local',
    experience: 11,
    rating: 4.9,
    isAvailable: true,
    languages: ['Hindi', 'English'],
    about: 'Dedicated pediatrician providing developmental guidance, newborn care, pediatric immunization, and seasonal infection care. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '10:00', endTime: '14:00' },
      { day: 'Tuesday', startTime: '16:00', endTime: '20:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '14:00' }
    ],
    clinicAddress: {
      street: 'Child Health Hub, Rajouri Garden',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110027',
      coordinates: [77.12, 28.6415]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Priya Sundaram (Test)',
    specialty: 'Gynecology',
    qualification: 'MBBS, MS (Obstetrics & Gynecology)',
    registrationNumber: 'TEST-GYN-10104',
    fee: 700,
    phone: '+91 99999 00104',
    email: 'test.dr.priya@quickmeds-staging.local',
    experience: 14,
    rating: 4.8,
    isAvailable: true,
    languages: ['English', 'Tamil', 'Hindi'],
    about: 'Obstetrician and gynecologist with deep expertise in adolescent reproductive health, prenatal guidance, PCOS, and fertility care. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '14:00', endTime: '18:00' },
      { day: 'Wednesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Friday', startTime: '14:00', endTime: '18:00' }
    ],
    clinicAddress: {
      street: 'Women Care Wing, South Extension',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110049',
      coordinates: [77.221, 28.5689]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Vikram Sethi (Test)',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD (Medicine), DM (Cardiology)',
    registrationNumber: 'TEST-CARD-10105',
    fee: 950,
    phone: '+91 99999 00105',
    email: 'test.dr.vikram@quickmeds-staging.local',
    experience: 18,
    rating: 4.9,
    isAvailable: true,
    languages: ['Hindi', 'English'],
    about: 'Interventional and preventive cardiologist with expertise in coronary artery disease, heart rhythm issues, and post-angioplasty care. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '11:00', endTime: '15:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '15:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ],
    clinicAddress: {
      street: 'Cardio Care Institute, Vasant Kunj',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110070',
      coordinates: [77.156, 28.5355]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Rajesh Iyer (Test)',
    specialty: 'Orthopedics',
    qualification: 'MBBS, MS (Orthopedics), M.Ch',
    registrationNumber: 'TEST-ORTH-10106',
    fee: 600,
    phone: '+91 99999 00106',
    email: 'test.dr.rajesh@quickmeds-staging.local',
    experience: 15,
    rating: 4.7,
    isAvailable: true,
    languages: ['English', 'Hindi', 'Malayalam'],
    about: 'Senior orthopedic specialist handling sports injuries, knee and hip arthritis, spine rehabilitation, and joint pain management. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '10:00', endTime: '14:00' },
      { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Friday', startTime: '15:00', endTime: '19:00' }
    ],
    clinicAddress: {
      street: 'Joint & Bone Health Center, Indirapuram',
      city: 'Ghaziabad',
      state: 'Uttar Pradesh',
      pincode: '201014',
      coordinates: [77.371, 28.641]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Meera Nambiar (Test)',
    specialty: 'ENT',
    qualification: 'MBBS, MS (ENT), DLO',
    registrationNumber: 'TEST-ENT-10107',
    fee: 500,
    phone: '+91 99999 00107',
    email: 'test.dr.meera@quickmeds-staging.local',
    experience: 10,
    rating: 4.8,
    isAvailable: true,
    languages: ['English', 'Hindi', 'Malayalam'],
    about: 'Otolaryngologist managing chronic sinusitis, allergic rhinitis, vertigo, tinnitus, and throat infections. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '09:00', endTime: '13:00' },
      { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
      { day: 'Saturday', startTime: '09:00', endTime: '13:00' }
    ],
    clinicAddress: {
      street: 'ENT Speciality Clinic, Dwarka Sector 10',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110075',
      coordinates: [77.065, 28.581]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Aditya Sen (Test)',
    specialty: 'Ophthalmology',
    qualification: 'MBBS, MS (Ophthalmology), FICO',
    registrationNumber: 'TEST-OPH-10108',
    fee: 550,
    phone: '+91 99999 00108',
    email: 'test.dr.aditya@quickmeds-staging.local',
    experience: 13,
    rating: 4.7,
    isAvailable: true,
    languages: ['English', 'Bengali', 'Hindi'],
    about: 'Eye specialist with focus on digital eye strain, diabetic retinopathy screening, dry eye syndrome, and refractive errors. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Wednesday', startTime: '11:00', endTime: '15:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '15:00' },
      { day: 'Saturday', startTime: '14:00', endTime: '18:00' }
    ],
    clinicAddress: {
      street: 'Vision Diagnostic Suite, CR Park',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110019',
      coordinates: [77.252, 28.536]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Tanvi Kulkarni (Test)',
    specialty: 'Psychiatry',
    qualification: 'MBBS, MD (Psychiatry)',
    registrationNumber: 'TEST-PSY-10109',
    fee: 850,
    phone: '+91 99999 00109',
    email: 'test.dr.tanvi@quickmeds-staging.local',
    experience: 8,
    rating: 4.9,
    isAvailable: true,
    languages: ['English', 'Marathi', 'Hindi'],
    about: 'Compassionate mental healthcare professional specializing in anxiety, depressive disorders, adult ADHD management, and insomnia. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '16:00', endTime: '20:00' },
      { day: 'Wednesday', startTime: '16:00', endTime: '20:00' },
      { day: 'Friday', startTime: '16:00', endTime: '20:00' }
    ],
    clinicAddress: {
      street: 'Mind Wellness Consulting Rooms, Noida Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      pincode: '201309',
      coordinates: [77.362, 28.628]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Siddharth Rao (Test)',
    specialty: 'Dentistry',
    qualification: 'BDS, MDS (Prosthodontics)',
    registrationNumber: 'TEST-DENT-10110',
    fee: 400,
    phone: '+91 99999 00110',
    email: 'test.dr.siddharth@quickmeds-staging.local',
    experience: 7,
    rating: 4.8,
    isAvailable: true,
    languages: ['English', 'Hindi', 'Kannada'],
    about: 'Dental surgeon focusing on preventive oral health, tooth sensitivity, gum diseases, and dental emergencies. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Thursday', startTime: '10:00', endTime: '14:00' },
      { day: 'Saturday', startTime: '10:00', endTime: '14:00' }
    ],
    clinicAddress: {
      street: 'Dental Care Center, Saket',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110017',
      coordinates: [77.215, 28.524]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Ananya Banerjee (Test)',
    specialty: 'Neurology',
    qualification: 'MBBS, MD (Medicine), DM (Neurology)',
    registrationNumber: 'TEST-NEUR-10111',
    fee: 1000,
    phone: '+91 99999 00111',
    email: 'test.dr.ananya@quickmeds-staging.local',
    experience: 16,
    rating: 4.9,
    isAvailable: true,
    languages: ['English', 'Bengali', 'Hindi'],
    about: 'Consultant neurologist with deep clinical interest in migraine headache syndromes, peripheral neuropathies, and epilepsy control. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Monday', startTime: '11:00', endTime: '15:00' },
      { day: 'Thursday', startTime: '11:00', endTime: '15:00' }
    ],
    clinicAddress: {
      street: 'Neurosciences Consulting Clinic, Lajpat Nagar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110024',
      coordinates: [77.243, 28.571]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Kunal Singhania (Test)',
    specialty: 'Gastroenterology',
    qualification: 'MBBS, MD, DNB (Gastroenterology)',
    registrationNumber: 'TEST-GAST-10112',
    fee: 800,
    phone: '+91 99999 00112',
    email: 'test.dr.kunal@quickmeds-staging.local',
    experience: 12,
    rating: 4.7,
    isAvailable: true,
    languages: ['Hindi', 'English'],
    about: 'Specialist in acid reflux (GERD), irritable bowel syndrome (IBS), fatty liver disease, and general digestive wellness. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '14:00', endTime: '18:00' },
      { day: 'Friday', startTime: '10:00', endTime: '14:00' }
    ],
    clinicAddress: {
      street: 'Digestive Health Suite, Paschim Vihar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110063',
      coordinates: [77.102, 28.672]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Pooja Verma (Test)',
    specialty: 'Pulmonology',
    qualification: 'MBBS, MD (Pulmonary Medicine), FCCP',
    registrationNumber: 'TEST-PULM-10113',
    fee: 750,
    phone: '+91 99999 00113',
    email: 'test.dr.pooja@quickmeds-staging.local',
    experience: 10,
    rating: 4.8,
    isAvailable: true,
    languages: ['Hindi', 'English'],
    about: 'Chest physician and pulmonologist specializing in bronchial asthma, allergic bronchitis, chronic cough, and sleep-disordered breathing. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Wednesday', startTime: '10:00', endTime: '14:00' },
      { day: 'Friday', startTime: '14:00', endTime: '18:00' }
    ],
    clinicAddress: {
      street: 'Respiratory Care Clinic, Mayur Vihar',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110091',
      coordinates: [77.302, 28.609]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dr. Harish Patel (Test)',
    specialty: 'Endocrinology',
    qualification: 'MBBS, MD (Medicine), DM (Endocrinology)',
    registrationNumber: 'TEST-ENDO-10114',
    fee: 900,
    phone: '+91 99999 00114',
    email: 'test.dr.harish@quickmeds-staging.local',
    experience: 14,
    rating: 4.9,
    isAvailable: true,
    languages: ['English', 'Gujarati', 'Hindi'],
    about: 'Endocrinologist specializing in comprehensive diabetes management, thyroid disorders, osteoporosis, and pituitary conditions. [TEST PRACTITIONER - STAGING ONLY]',
    availableSlots: [
      { day: 'Tuesday', startTime: '15:00', endTime: '19:00' },
      { day: 'Saturday', startTime: '11:00', endTime: '15:00' }
    ],
    clinicAddress: {
      street: 'Endocrine & Metabolic Clinic, Punjabi Bagh',
      city: 'New Delhi',
      state: 'Delhi',
      pincode: '110026',
      coordinates: [77.132, 28.669]
    },
    verificationStatus: 'VERIFIED',
    verificationNotes: 'Verified for staging/development testing environment',
    verifiedAt: new Date(),
    isActive: true,
    isTestData: true
  }
];

// ==========================================
// 3. FICTIONAL DIAGNOSTIC TESTS DATA (20 TESTS)
// ==========================================
const testLabData = [
  {
    name: 'Complete Blood Count (CBC) [Test]',
    category: 'Blood Tests',
    description: 'Comprehensive evaluation of cellular blood components including hemoglobin, white cells, red cells, and platelets. [STAGING TEST RECORD]',
    price: 350,
    preparationInstructions: 'No fasting required. Maintain normal water intake.',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['Hemoglobin', 'RBC Count', 'Total Leukocyte Count (TLC)', 'Platelet Count', 'PCV / Hematocrit', 'MCV', 'MCH', 'MCHC', 'Differential Leukocyte Count'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Urine Routine & Microscopic Examination [Test]',
    category: 'Blood Tests',
    description: 'Physical, chemical, and microscopic examination of urine to detect urinary tract infections, renal dysfunction, and metabolic changes. [STAGING TEST RECORD]',
    price: 220,
    preparationInstructions: 'First morning mid-stream clean catch urine sample preferred in sterile container.',
    reportTimeHours: 12,
    sampleType: 'Urine',
    parametersIncluded: ['Color', 'Transparency', 'Specific Gravity', 'pH', 'Protein/Albumin', 'Glucose', 'Ketone Bodies', 'Pus Cells', 'RBCs', 'Epithelial Cells', 'Casts & Crystals'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Erythrocyte Sedimentation Rate (ESR) [Test]',
    category: 'Blood Tests',
    description: 'Standard inflammatory and non-specific systemic marker test. [STAGING TEST RECORD]',
    price: 150,
    preparationInstructions: 'No fasting required.',
    reportTimeHours: 8,
    sampleType: 'Blood',
    parametersIncluded: ['Westergren ESR (1 hour reading)'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Blood Group ABO & Rh Factor [Test]',
    category: 'Blood Tests',
    description: 'Determination of ABO blood group and Rhesus (RhD) factor antigen status. [STAGING TEST RECORD]',
    price: 180,
    preparationInstructions: 'No fasting or dietary restriction required.',
    reportTimeHours: 6,
    sampleType: 'Blood',
    parametersIncluded: ['ABO Blood Group', 'Rh Factor (Positive/Negative)'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Fasting Blood Glucose (FBS) [Test]',
    category: 'Diabetes',
    description: 'Measures blood glucose concentration after an overnight fast to screen for prediabetes and diabetes mellitus. [STAGING TEST RECORD]',
    price: 120,
    preparationInstructions: 'Strict overnight fasting of 10 to 12 hours required. Water is permitted.',
    reportTimeHours: 8,
    sampleType: 'Blood',
    parametersIncluded: ['Fasting Blood Glucose'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'HbA1c Glycated Hemoglobin [Test]',
    category: 'Diabetes',
    description: 'Measures average blood sugar levels over the preceding 2 to 3 months. Gold standard for long-term glycemic control. [STAGING TEST RECORD]',
    price: 450,
    preparationInstructions: 'No fasting required. Can be taken at any time of day.',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['HbA1c (% of total hemoglobin)', 'Estimated Average Glucose (eAG mg/dL)'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Postprandial Blood Glucose (PPBS) [Test]',
    category: 'Diabetes',
    description: 'Evaluates blood sugar regulation exactly 2 hours after a meal. [STAGING TEST RECORD]',
    price: 120,
    preparationInstructions: 'Sample collection exactly 2 hours after starting breakfast or main meal.',
    reportTimeHours: 8,
    sampleType: 'Blood',
    parametersIncluded: ['Postprandial Blood Glucose (2 hrs post meal)'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'TSH Thyroid Stimulating Hormone [Test]',
    category: 'Thyroid',
    description: 'Ultrasensitive assessment of pituitary thyroid control. First-line test for hypothyroidism and hyperthyroidism. [STAGING TEST RECORD]',
    price: 280,
    preparationInstructions: 'Early morning fasting sample preferred. Take thyroid medicine after blood collection unless advised otherwise.',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['Ultrasensitive TSH'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Complete Thyroid Profile (T3, T4, TSH) [Test]',
    category: 'Thyroid',
    description: 'Comprehensive evaluation of thyroid gland functioning and hormone output. [STAGING TEST RECORD]',
    price: 550,
    preparationInstructions: 'Fasting preferred. Early morning collection recommended.',
    reportTimeHours: 16,
    sampleType: 'Blood',
    parametersIncluded: ['Total Triiodothyronine (T3)', 'Total Thyroxine (T4)', 'Thyroid Stimulating Hormone (TSH)'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Lipid Profile Comprehensive [Test]',
    category: 'Heart',
    description: 'Standard cardiovascular risk profile assessing good and bad cholesterol, triglycerides, and risk ratios. [STAGING TEST RECORD]',
    price: 650,
    preparationInstructions: 'Strict 12 to 14 hours overnight fasting required. Avoid alcohol for 24 hours prior.',
    reportTimeHours: 16,
    sampleType: 'Blood',
    parametersIncluded: ['Total Cholesterol', 'HDL (Good) Cholesterol', 'LDL (Bad) Cholesterol', 'VLDL Cholesterol', 'Serum Triglycerides', 'TC/HDL Ratio', 'LDL/HDL Ratio'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'High-Sensitivity CRP (hs-CRP) [Test]',
    category: 'Heart',
    description: 'Sensitive cardiovascular inflammatory biomarker for atherosclerotic vascular risk assessment. [STAGING TEST RECORD]',
    price: 590,
    preparationInstructions: 'No fasting required. Ensure patient is free of acute viral or bacterial illness.',
    reportTimeHours: 16,
    sampleType: 'Blood',
    parametersIncluded: ['hs-CRP High Sensitivity'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Liver Function Test (LFT) [Test]',
    category: 'Liver',
    description: 'Complete panel assessing hepatic enzyme integrity, excretory capacity, and synthetic function. [STAGING TEST RECORD]',
    price: 750,
    preparationInstructions: 'Overnight fasting of 8-10 hours recommended. Avoid alcohol 48 hours prior.',
    reportTimeHours: 16,
    sampleType: 'Blood',
    parametersIncluded: ['Bilirubin Total', 'Bilirubin Direct', 'Bilirubin Indirect', 'SGOT / AST', 'SGPT / ALT', 'Alkaline Phosphatase (ALP)', 'Total Protein', 'Serum Albumin', 'A/G Ratio'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Kidney Function Test (KFT / RFT) [Test]',
    category: 'Kidney',
    description: 'Assesses renal filtration capacity, glomerular filtration, and electrolyte/waste elimination. [STAGING TEST RECORD]',
    price: 680,
    preparationInstructions: 'Normal hydration encouraged. Avoid unaccustomed strenuous exercise 24 hours prior.',
    reportTimeHours: 16,
    sampleType: 'Blood',
    parametersIncluded: ['Blood Urea Nitrogen (BUN)', 'Serum Creatinine', 'BUN/Creatinine Ratio', 'Serum Uric Acid', 'Estimated GFR (eGFR)'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Serum Uric Acid [Test]',
    category: 'Kidney',
    description: 'Measures circulating uric acid levels for gout diagnosis, renal calculus risk, and purine metabolism assessment. [STAGING TEST RECORD]',
    price: 200,
    preparationInstructions: 'Overnight fasting preferred.',
    reportTimeHours: 10,
    sampleType: 'Blood',
    parametersIncluded: ['Serum Uric Acid'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Vitamin D 25-Hydroxy [Test]',
    category: 'Vitamins',
    description: 'Evaluates total 25-OH Vitamin D status for bone mineral density, calcium metabolism, and immune support. [STAGING TEST RECORD]',
    price: 1100,
    preparationInstructions: 'No fasting required. Maintain regular diet.',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['25-OH Vitamin D Total (D2 + D3)'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Vitamin B12 Cyanocobalamin [Test]',
    category: 'Vitamins',
    description: 'Measures active serum vitamin B12 for investigation of megaloblastic anemia and peripheral neuropathies. [STAGING TEST RECORD]',
    price: 890,
    preparationInstructions: 'Overnight fasting preferred. Avoid vitamin supplement pills 24 hours before sampling.',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Serum Vitamin B12 Concentration'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Quantitative C-Reactive Protein (CRP) [Test]',
    category: 'Infection',
    description: 'Acute-phase reactant test to detect active tissue inflammation, infection, and systemic inflammatory disease. [STAGING TEST RECORD]',
    price: 380,
    preparationInstructions: 'No fasting required.',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['Serum C-Reactive Protein (Quantitative mg/L)'],
    isPopular: false,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Dengue NS1 Antigen & Rapid Serology [Test]',
    category: 'Infection',
    description: 'Early acute detection of Dengue viral NS1 antigen along with differential IgM/IgG antibodies. [STAGING TEST RECORD]',
    price: 850,
    preparationInstructions: 'No fasting required. Immediate sample processing.',
    reportTimeHours: 6,
    sampleType: 'Blood',
    parametersIncluded: ['Dengue NS1 Antigen', 'Dengue IgM Antibody', 'Dengue IgG Antibody'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Basic Executive Health Package [Test]',
    category: 'Wellness Packages',
    description: 'Comprehensive preventive screen covering CBC, lipid profile, liver, kidney, and blood sugar in one home collection. [STAGING TEST RECORD]',
    price: 1999,
    preparationInstructions: '10 to 12 hours overnight fasting mandatory. Water allowed.',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['CBC (24 Parameters)', 'Lipid Profile Complete', 'Liver Function Test', 'Kidney Function Test', 'Fasting Blood Glucose', 'Urine Routine & Microscopic'],
    isPopular: true,
    isActive: true,
    isTestData: true
  },
  {
    name: 'Comprehensive Diabetes & Metabolic Screen [Test]',
    category: 'Wellness Packages',
    description: 'Specialized metabolic panel for diabetic monitoring including HbA1c, fasting glucose, renal microalbumin, and lipid screen. [STAGING TEST RECORD]',
    price: 1499,
    preparationInstructions: '10 to 12 hours fasting required.',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['HbA1c Glycated Hemoglobin', 'Fasting Blood Sugar', 'Lipid Profile', 'Serum Creatinine', 'Urine Microalbumin'],
    isPopular: true,
    isActive: true,
    isTestData: true
  }
];

// ==========================================
// 4. SEED EXECUTION LOGIC (IDEMPOTENT)
// ==========================================
const seedHealthcareTestData = async () => {
  verifyEnvironmentSafety();

  console.log('\n======================================================');
  console.log('🩺 QuickMeds: Seeding Development/Staging Healthcare Data');
  console.log('======================================================\n');

  await connectDB();

  let doctorCount = 0;
  let labCount = 0;

  // 1. Upsert Fictional Doctors
  console.log(`[Seed] Processing ${testDoctorsData.length} fictional test doctors...`);
  for (const doc of testDoctorsData) {
    // Optionally create/link a test User account for the doctor
    let user = await User.findOne({ email: doc.email });
    if (!user) {
      user = await User.create({
        name: doc.name,
        email: doc.email,
        phone: doc.phone,
        password: 'Password@123',
        role: 'DOCTOR',
        isDemo: true,
        isTestData: true,
        isActive: true
      });
    }

    const doctorDoc = {
      ...doc,
      userId: user._id
    };

    const savedDoc = await Doctor.findOneAndUpdate(
      { registrationNumber: doc.registrationNumber },
      doctorDoc,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Link doctor to user
    if (!user.doctorId) {
      user.doctorId = savedDoc._id;
      await user.save();
    }

    doctorCount++;
  }
  console.log(`[Seed] ✅ ${doctorCount} test doctors upserted successfully.`);

  // 2. Upsert Diagnostic Tests
  console.log(`[Seed] Processing ${testLabData.length} diagnostic test records...`);
  for (const test of testLabData) {
    await LabTest.findOneAndUpdate(
      { name: test.name, isTestData: true },
      test,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    labCount++;
  }
  console.log(`[Seed] ✅ ${labCount} test diagnostic tests upserted successfully.`);

  console.log('\n======================================================');
  console.log('🎉 SEEDING COMPLETED SUCCESSFULLY!');
  console.log(`   • Doctors seeded: ${doctorCount}`);
  console.log(`   • Lab tests seeded: ${labCount}`);
  console.log('   • All records marked with: isTestData: true');
  console.log('   • Real production collections untouched.');
  console.log('======================================================\n');
};

// ==========================================
// 5. CLEANUP EXECUTION LOGIC (TEST DATA ONLY)
// ==========================================
const clearHealthcareTestData = async () => {
  verifyEnvironmentSafety();

  console.log('\n======================================================');
  console.log('🧹 QuickMeds: Clearing Healthcare TEST DATA Only');
  console.log('======================================================\n');

  await connectDB();

  // Find all test doctor IDs to safely clean up any test bookings/consultations
  const testDoctors = await Doctor.find({ isTestData: true }).select('_id');
  const testDoctorIds = testDoctors.map(d => d._id);

  const [delDoctors, delLabTests, delUsers, delConsultations, delBookings] = await Promise.all([
    Doctor.deleteMany({ isTestData: true }),
    LabTest.deleteMany({ isTestData: true }),
    User.deleteMany({ isTestData: true, role: 'DOCTOR' }),
    Consultation.deleteMany({
      $or: [{ isTestData: true }, { doctorId: { $in: testDoctorIds } }]
    }),
    LabBooking.deleteMany({ isTestData: true })
  ]);

  console.log(`[Cleanup] Deleted ${delDoctors.deletedCount} test doctors.`);
  console.log(`[Cleanup] Deleted ${delLabTests.deletedCount} test lab tests.`);
  console.log(`[Cleanup] Deleted ${delUsers.deletedCount} test doctor user accounts.`);
  console.log(`[Cleanup] Deleted ${delConsultations.deletedCount} test consultations.`);
  console.log(`[Cleanup] Deleted ${delBookings.deletedCount} test lab bookings.`);

  console.log('\n======================================================');
  console.log('✅ HEALTHCARE TEST DATA CLEANUP COMPLETE.');
  console.log('   • All non-test records and master catalogs remain intact.');
  console.log('======================================================\n');
};

// Handle CLI execution
if (require.main === module) {
  const isClear = process.argv.includes('--clear') || process.argv.includes('-c');

  const action = isClear ? clearHealthcareTestData : seedHealthcareTestData;

  action()
    .then(() => {
      mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error('\n❌ Execution failed:', err.message);
      mongoose.disconnect();
      process.exit(1);
    });
}

module.exports = {
  seedHealthcareTestData,
  clearHealthcareTestData,
  testDoctorsData,
  testLabData
};
