import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Mail, Phone, Lock, Store, Bike, Stethoscope, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') || 'CUSTOMER';

  const [role, setRole] = useState(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Pharmacy specific fields
  const [pharmacyName, setPharmacyName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('110001');

  // Delivery specific fields
  const [vehicleType, setVehicleType] = useState('Bike');
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [drivingLicense, setDrivingLicense] = useState('');

  // Doctor specific fields
  const [specialty, setSpecialty] = useState('General Medicine');
  const [qualification, setQualification] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fee, setFee] = useState('');
  const [experience, setExperience] = useState('');

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !phone || !password) {
      showToast('Please fill in all mandatory fields', 'warning');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name,
        email,
        phone,
        password,
        role
      };

      if (role === 'PHARMACY') {
        payload.pharmacyDetails = {
          name: pharmacyName || `${name}'s Pharmacy`,
          licenseNumber: licenseNumber || `DL-${Date.now().toString().slice(-6)}`,
          phone,
          address: {
            street: street || 'Main Road',
            city,
            state: 'Delhi',
            pincode,
            fullAddress: `${street || 'Main Road'}, ${city}, Delhi ${pincode}`
          },
          coordinates: [77.209, 28.6139]
        };
      } else if (role === 'DELIVERY_PARTNER') {
        payload.deliveryDetails = {
          vehicleType,
          vehicleNumber: vehicleNumber || `DL-01-AB-${Math.floor(1000 + Math.random() * 9000)}`,
          drivingLicenseNumber: drivingLicense || `DL-IN-${Date.now().toString().slice(-6)}`
        };
      } else if (role === 'DOCTOR') {
        if (!registrationNumber || !qualification || !fee) {
          showToast('Please provide your registration number, qualification and consultation fee', 'warning');
          setLoading(false);
          return;
        }
        payload.specialty = specialty;
        payload.qualification = qualification.trim();
        payload.registrationNumber = registrationNumber.trim();
        payload.fee = Number(fee);
        if (experience) payload.experience = Number(experience);
      }

      const user = await register(payload);
      showToast('Registration successful! Welcome to QuickMeds.', 'success');

      if (user.role === 'PHARMACY') navigate('/pharmacy');
      else if (user.role === 'DELIVERY_PARTNER') navigate('/delivery');
      else if (user.role === 'DOCTOR') navigate('/doctor');
      else navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', textAlign: 'center' }}>
        Create an Account
      </h2>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '1.5rem' }}>
        Choose your role to get started on QuickMeds.
      </p>

      {/* Role Selection Tabs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '6px',
          backgroundColor: 'var(--bg-subtle)',
          padding: '4px',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem'
        }}
      >
        <button
          type="button"
          onClick={() => setRole('CUSTOMER')}
          style={{
            padding: '8px 2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: role === 'CUSTOMER' ? 'var(--bg-card)' : 'transparent',
            color: role === 'CUSTOMER' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: role === 'CUSTOMER' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <User size={14} /> Customer
        </button>

        <button
          type="button"
          onClick={() => setRole('DOCTOR')}
          style={{
            padding: '8px 2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: role === 'DOCTOR' ? 'var(--bg-card)' : 'transparent',
            color: role === 'DOCTOR' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: role === 'DOCTOR' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Stethoscope size={14} /> Doctor
        </button>

        <button
          type="button"
          onClick={() => setRole('PHARMACY')}
          style={{
            padding: '8px 2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: role === 'PHARMACY' ? 'var(--bg-card)' : 'transparent',
            color: role === 'PHARMACY' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: role === 'PHARMACY' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Store size={14} /> Pharmacy
        </button>

        <button
          type="button"
          onClick={() => setRole('DELIVERY_PARTNER')}
          style={{
            padding: '8px 2px',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            backgroundColor: role === 'DELIVERY_PARTNER' ? 'var(--bg-card)' : 'transparent',
            color: role === 'DELIVERY_PARTNER' ? 'var(--primary-600)' : 'var(--text-muted)',
            boxShadow: role === 'DELIVERY_PARTNER' ? 'var(--shadow-xs)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px'
          }}
        >
          <Bike size={14} /> Delivery
        </button>
      </div>

      <form onSubmit={handleRegister}>
        <Input
          label="Full Name"
          placeholder="e.g. Amit Verma"
          icon={User}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.g. amit@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Input
          label="10-digit Mobile Phone"
          type="tel"
          placeholder="e.g. 9876543210"
          icon={Phone}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />

        {/* Conditional Pharmacy Fields */}
        {role === 'PHARMACY' && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--primary-200)'
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '8px' }}>
              Pharmacy Verification Details
            </p>
            <Input
              label="Pharmacy / Store Name"
              placeholder="e.g. Sanjeevani Medicos"
              value={pharmacyName}
              onChange={(e) => setPharmacyName(e.target.value)}
              required
            />
            <Input
              label="Drug Retail License Number"
              placeholder="e.g. DL-ND-2026-XXXXX"
              value={licenseNumber}
              onChange={(e) => setLicenseNumber(e.target.value)}
              required
            />
            <Input
              label="Street / Market Address"
              placeholder="e.g. 15 Main Market, Janakpuri"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              required
            />
          </div>
        )}

        {/* Conditional Delivery Partner Fields */}
        {role === 'DELIVERY_PARTNER' && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--primary-200)'
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '8px' }}>
              Fleet Rider Details
            </p>
            <Input
              label="Vehicle Type"
              as="select"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            >
              <option value="Bike">Motorcycle / Bike</option>
              <option value="Scooter">Scooter</option>
              <option value="EV Scooter">Electric Scooter (EV)</option>
              <option value="Bicycle">Bicycle</option>
            </Input>
            <Input
              label="Vehicle Registration Number"
              placeholder="e.g. DL-01-AB-1234"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />
          </div>
        )}

        {/* Conditional Doctor Fields */}
        {role === 'DOCTOR' && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--primary-50)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1rem',
              border: '1px solid var(--primary-200)'
            }}
          >
            <p style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-900)', marginBottom: '8px' }}>
              Doctor Verification Details
            </p>
            <Input
              label="Medical Specialty"
              as="select"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Gynecology">Gynecology</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="ENT">ENT</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Psychiatry">Psychiatry</option>
              <option value="Neurology">Neurology</option>
              <option value="Gastroenterology">Gastroenterology</option>
              <option value="Pulmonology">Pulmonology</option>
              <option value="Endocrinology">Endocrinology</option>
              <option value="Urology">Urology</option>
              <option value="General Surgery">General Surgery</option>
              <option value="Dentistry">Dentistry</option>
            </Input>
            <Input
              label="Medical Registration / License Number"
              placeholder="e.g. MCI-12345 or DMC-67890"
              value={registrationNumber}
              onChange={(e) => setRegistrationNumber(e.target.value)}
              required
            />
            <Input
              label="Qualifications / Degrees"
              placeholder="e.g. MBBS, MD (General Medicine)"
              value={qualification}
              onChange={(e) => setQualification(e.target.value)}
              required
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Input
                label="Consultation Fee (₹)"
                type="number"
                min="0"
                placeholder="e.g. 500"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
              />
              <Input
                label="Experience (years)"
                type="number"
                min="0"
                placeholder="e.g. 8"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
              Doctor profiles are reviewed by an administrator before appearing in public listings.
            </p>
          </div>
        )}

        <Input
          label="Password (min 6 characters)"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" size="lg" fullWidth loading={loading}>
          Register as {role === 'CUSTOMER' ? 'Customer' : role === 'DOCTOR' ? 'Doctor' : role === 'PHARMACY' ? 'Pharmacy Partner' : 'Delivery Rider'}
        </Button>
      </form>

      <div
        style={{
          marginTop: '1.5rem',
          textAlign: 'center',
          fontSize: '0.875rem',
          color: 'var(--text-muted)'
        }}
      >
        Already have an account?{' '}
        <Link to="/login" style={{ fontWeight: 600, color: 'var(--primary-600)' }}>
          Sign In
        </Link>
      </div>
    </div>
  );
};

export default Register;
