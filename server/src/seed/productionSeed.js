require('dotenv').config();
const mongoose = require('mongoose');
const env = require('../config/env');
const Doctor = require('../models/Doctor');
const LabTest = require('../models/LabTest');

const doctors = [
  {
    name: 'Dr. Ramesh Kumar',
    specialty: 'General Medicine',
    qualification: 'MBBS, MD',
    registrationNumber: 'MCI-12345',
    fee: 500,
    phone: '9876543210',
    availableSlots: [{ day: 'Monday', startTime: '10:00', endTime: '14:00' }],
    rating: 4.8,
    isAvailable: true,
    experience: 15,
    languages: ['Hindi', 'English']
  },
  {
    name: 'Dr. Sunita Sharma',
    specialty: 'Gynecology',
    qualification: 'MBBS, MS',
    registrationNumber: 'MCI-12346',
    fee: 800,
    phone: '9876543211',
    availableSlots: [{ day: 'Tuesday', startTime: '09:00', endTime: '13:00' }],
    rating: 4.9,
    isAvailable: true,
    experience: 20,
    languages: ['Hindi', 'English']
  },
  {
    name: 'Dr. Amit Patel',
    specialty: 'Pediatrics',
    qualification: 'MBBS, MD (Pediatrics)',
    registrationNumber: 'MCI-12347',
    fee: 600,
    phone: '9876543212',
    availableSlots: [{ day: 'Wednesday', startTime: '16:00', endTime: '20:00' }],
    rating: 4.7,
    isAvailable: true,
    experience: 12,
    languages: ['Gujarati', 'Hindi', 'English']
  },
  {
    name: 'Dr. Priya Desai',
    specialty: 'Dermatology',
    qualification: 'MBBS, DDVL',
    registrationNumber: 'MCI-12348',
    fee: 700,
    phone: '9876543213',
    availableSlots: [{ day: 'Thursday', startTime: '11:00', endTime: '15:00' }],
    rating: 4.6,
    isAvailable: true,
    experience: 8,
    languages: ['Marathi', 'Hindi', 'English']
  },
  {
    name: 'Dr. Vikram Singh',
    specialty: 'Cardiology',
    qualification: 'MBBS, MD, DM',
    registrationNumber: 'MCI-12349',
    fee: 1200,
    phone: '9876543214',
    availableSlots: [{ day: 'Friday', startTime: '10:00', endTime: '14:00' }],
    rating: 4.9,
    isAvailable: true,
    experience: 25,
    languages: ['Hindi', 'English']
  }
];

const labTests = [
  {
    name: 'Complete Blood Count (CBC)',
    category: 'Blood Tests',
    description: 'Measures different parts of your blood.',
    price: 300,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['Hemoglobin', 'WBC', 'RBC', 'Platelets'],
    isPopular: true
  },
  {
    name: 'Lipid Profile',
    category: 'Heart',
    description: 'Measures cholesterol levels to assess heart disease risk.',
    price: 600,
    preparationInstructions: '10-12 hours fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Total Cholesterol', 'HDL', 'LDL', 'Triglycerides'],
    isPopular: true
  },
  {
    name: 'HbA1c',
    category: 'Diabetes',
    description: 'Measures average blood sugar levels over the past 3 months.',
    price: 500,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['HbA1c'],
    isPopular: true
  },
  {
    name: 'Thyroid Profile',
    category: 'Thyroid',
    description: 'Measures thyroid gland function.',
    price: 700,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['T3', 'T4', 'TSH'],
    isPopular: true
  },
  {
    name: 'Liver Function Test (LFT)',
    category: 'Liver',
    description: 'Checks how well the liver is working.',
    price: 800,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Bilirubin', 'SGOT', 'SGPT', 'Alkaline Phosphatase'],
    isPopular: true
  },
  {
    name: 'Kidney Function Test (KFT)',
    category: 'Kidney',
    description: 'Measures how well the kidneys are working.',
    price: 700,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Urea', 'Creatinine', 'Uric Acid'],
    isPopular: true
  },
  {
    name: 'Complete Urine Examination',
    category: 'Blood Tests', // Map to valid enum or use separate category if needed, using Blood Tests for general
    description: 'Checks for signs of disease in urine.',
    price: 200,
    preparationInstructions: 'First morning urine preferred',
    reportTimeHours: 12,
    sampleType: 'Urine',
    parametersIncluded: ['Color', 'pH', 'Proteins', 'Glucose'],
    isPopular: true
  },
  {
    name: 'Vitamin D',
    category: 'Vitamins',
    description: 'Measures the level of Vitamin D in the blood.',
    price: 1200,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['25-OH Vitamin D'],
    isPopular: true
  },
  {
    name: 'Vitamin B12',
    category: 'Vitamins',
    description: 'Measures the level of Vitamin B12 in the blood.',
    price: 1000,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Vitamin B12'],
    isPopular: true
  },
  {
    name: 'Iron Profile',
    category: 'Blood Tests',
    description: 'Measures the amount of iron in your body.',
    price: 800,
    preparationInstructions: '12 hours fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Serum Iron', 'TIBC', 'Ferritin'],
    isPopular: false
  },
  {
    name: 'Full Body Checkup - Basic',
    category: 'Wellness Packages',
    description: 'A comprehensive checkup covering vital organs.',
    price: 2500,
    preparationInstructions: '10-12 hours fasting required',
    reportTimeHours: 48,
    sampleType: 'Blood',
    parametersIncluded: ['CBC', 'LFT', 'KFT', 'Lipid Profile', 'Thyroid Profile'],
    isPopular: true
  },
  {
    name: 'Diabetes Screening Package',
    category: 'Diabetes',
    description: 'Essential tests for monitoring diabetes.',
    price: 1500,
    preparationInstructions: 'Fasting required for Fasting Blood Sugar',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Fasting Blood Sugar', 'Post Prandial Blood Sugar', 'HbA1c', 'Urine Microalbumin'],
    isPopular: false
  },
  {
    name: 'Cardiac Risk Assessment',
    category: 'Heart',
    description: 'Evaluates the risk of heart disease.',
    price: 2000,
    preparationInstructions: '10-12 hours fasting required',
    reportTimeHours: 24,
    sampleType: 'Blood',
    parametersIncluded: ['Lipid Profile', 'hs-CRP', 'Homocysteine'],
    isPopular: false
  },
  {
    name: 'Dengue NS1 Antigen',
    category: 'Infection',
    description: 'Detects the presence of Dengue virus in early stages.',
    price: 800,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 12,
    sampleType: 'Blood',
    parametersIncluded: ['Dengue NS1 Antigen'],
    isPopular: false
  },
  {
    name: 'COVID-19 RT-PCR',
    category: 'Infection',
    description: 'Detects the presence of SARS-CoV-2 virus.',
    price: 700,
    preparationInstructions: 'No fasting required',
    reportTimeHours: 24,
    sampleType: 'Swab',
    parametersIncluded: ['SARS-CoV-2 RNA'],
    isPopular: false
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(env.MONGODB_URI);
    console.log('Connected to MongoDB');

    console.log('Clearing old doctors and lab tests...');
    await Doctor.deleteMany({});
    await LabTest.deleteMany({});

    console.log('Inserting 5 Doctors...');
    await Doctor.insertMany(doctors);

    console.log('Inserting 15 Lab Tests...');
    await LabTest.insertMany(labTests);

    console.log('Data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
