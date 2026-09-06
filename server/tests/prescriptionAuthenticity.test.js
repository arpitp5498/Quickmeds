const {
  analyzePrescriptionAuthenticity
} = require('../src/services/prescriptionAuthenticityService');

describe('Prescription AI-Generated Image Authenticity Screening Service', () => {
  test('1. Accurately flags document with synthetic generative AI prompt metadata as HIGH RISK', () => {
    const syntheticBuffer = Buffer.from(
      'RIFF....WEBPVP8 ... Parameters\nPrompt: Realistic medical prescription on doctor letterhead for Dolo 650, signed by Dr. Sharma, highly detailed, 8k resolution, photorealistic\nNegative prompt: blurry, deformed\nSteps: 30, Sampler: DPM++ 2M, CFG scale: 7, Seed: 4920194, Size: 1024x1024, Model: Stable Diffusion v1.5'
    );

    const result = analyzePrescriptionAuthenticity(
      syntheticBuffer,
      'image/jpeg',
      'prescription_sample.jpg'
    );

    expect(result.riskLevel).toBe('HIGH RISK');
    expect(result.signals.length).toBeGreaterThanOrEqual(4);
    const aiSignal = result.signals.find((s) => s.name === 'AI Generator Signatures');
    expect(aiSignal).toBeDefined();
    expect(aiSignal.status).toBe('FLAG');
    expect(result.recommendation).toContain('Pharmacist should independently cross-verify');
    expect(result.disclaimer).toContain('licensed pharmacist remains the sole authorized');
  });

  test('2. Accurately evaluates smartphone camera capture with authentic EXIF as LOW RISK', () => {
    const authenticBuffer = Buffer.from(
      'Exif\x00\x00MM\x00*....Make\x00Apple\x00Model\x00iPhone 14 Pro\x00DateTimeOriginal\x002026:08:15 14:30:00\x00...Rx Dr. Mehta Clinic Hospital MBBS Date Tab Dolo 650mg'
    );

    const result = analyzePrescriptionAuthenticity(
      authenticBuffer,
      'image/jpeg',
      'IMG_4910.JPG',
      { doctorName: 'Dr. Mehta' }
    );

    expect(result.riskLevel).toBe('LOW RISK');
    const aiSignal = result.signals.find((s) => s.name === 'AI Generator Signatures');
    expect(aiSignal.status).toBe('PASS');
    const hardwareSignal = result.signals.find((s) => s.name === 'Camera Hardware EXIF');
    expect(hardwareSignal.status).toBe('PASS');
    expect(hardwareSignal.evidence).toContain('APPLE');
  });

  test('3. Categorizes re-compressed / metadata-stripped document as MEDIUM RISK for clinical attention', () => {
    const strippedBuffer = Buffer.from(
      'Standard JPEG data without any camera tags or AI tags ... plain binary stream'
    );

    const result = analyzePrescriptionAuthenticity(
      strippedBuffer,
      'image/jpeg',
      'whatsapp_image.jpg'
    );

    expect(result.riskLevel).toBe('MEDIUM RISK');
    const aiSignal = result.signals.find((s) => s.name === 'AI Generator Signatures');
    expect(aiSignal.status).toBe('PASS');
    expect(result.recommendation).toContain('Inspect handwriting legibility');
  });

  test('4. Includes standard clinical disclaimer affirming pharmacist final authority', () => {
    const result = analyzePrescriptionAuthenticity(Buffer.from('test'), 'image/png');
    expect(result.disclaimer).toMatch(/licensed pharmacist remains the sole authorized clinical decision maker/i);
  });
});
