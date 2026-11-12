import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Banknote, Clock, FileCheck, MapPin, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from '../../context/LocationContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import Button from '../../components/ui/Button';
import FileUpload from '../../components/ui/FileUpload';
import LocationPicker from '../../components/common/LocationPicker';
import EmptyState from '../../components/ui/EmptyState';
import '../cart/basket.css';

function isPrice(value) {
  return Number.isFinite(value) && value >= 0;
}

function validateQuote(plan, items) {
  const fees = plan?.priceBreakdown;
  const lines = plan?.pharmacies?.[0]?.itemsFulfilled;
  return plan?.type === 'SINGLE_STORE' && plan.basketCoverage === 1 &&
    [plan.totalOrderValue, fees?.itemsSubtotal, fees?.deliveryFee, fees?.platformFee].every(isPrice) &&
    Array.isArray(lines) && lines.length === items.length &&
    items.every(([id, quantity]) => lines.some(line =>
      line.medicineId === id && line.requestedQty === quantity && isPrice(line.totalPrice)));
}

const Checkout = () => {
  const { cart, refreshCart, loading: cartLoading } = useCart();
  const { user } = useAuth();
  const { location } = useLocation();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [savedAddresses, setSavedAddresses] = useState(null);
  const [addressId, setAddressId] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [customStreet, setCustomStreet] = useState('');
  const [orderArea, setOrderArea] = useState(location.confirmed ? { addressId: '', area: location } : null);
  const [customCity, setCustomCity] = useState(location.confirmed && location.city !== 'Current Area' ? location.city : '');
  const [customState, setCustomState] = useState('');
  const [customPincode, setCustomPincode] = useState('');
  const [prescriptionFile, setPrescriptionFile] = useState(null);
  const [existingPrescriptions, setExistingPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState('');
  const [prescriptionError, setPrescriptionError] = useState(false);
  const [optionalPrescription, setOptionalPrescription] = useState(false);
  const [quote, setQuote] = useState(null);
  const [quoteAttempt, setQuoteAttempt] = useState(0);
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    let current = true;
    api.get('/users/addresses').then(response => {
      if (!current) return;
      const addresses = response.data?.addresses;
      if (!Array.isArray(addresses)) throw new Error('Addresses unavailable');
      setSavedAddresses(addresses);
      setAddressId((addresses.find(address => address.isDefault) || addresses[0])?._id || '');
    }).catch(() => {
      if (current) {
        setAddressError(true);
        setSavedAddresses([]);
      }
    });
    return () => { current = false; };
  }, []);

  const showPrescription = cart.hasPrescriptionRequiredItems || optionalPrescription;
  useEffect(() => {
    if (!showPrescription) return;
    let current = true;
    api.get('/prescriptions').then(response => {
      if (!current) return;
      const prescriptions = response.data?.prescriptions;
      if (!Array.isArray(prescriptions)) throw new Error('Prescriptions unavailable');
      setExistingPrescriptions(prescriptions.filter(rx =>
        !rx.orderId && ['UPLOADED', 'APPROVED'].includes(rx.status)));
    }).catch(() => { if (current) setPrescriptionError(true); });
    return () => { current = false; };
  }, [showPrescription]);

  const selectedAddress = savedAddresses?.find(address => address._id === addressId);
  const chosenArea = orderArea?.addressId === addressId ? orderArea.area : null;
  const coordinates = chosenArea ? [chosenArea.lng, chosenArea.lat] :
    selectedAddress?.coordinatesConfirmed ? selectedAddress.coordinates : null;
  function selectOrderArea(area) {
    setOrderArea({ addressId, area });
    if (!addressId && area.city !== 'Current Area') setCustomCity(area.city);
  }
  const items = cart.items.map(item => [item.medicineId?._id || item.medicineId, item.quantity]);
  const quoteKey = coordinates && savedAddresses && !cartLoading && items.length
    ? JSON.stringify([coordinates, items, quoteAttempt]) : null;

  useEffect(() => {
    if (!quoteKey) return;
    let current = true;
    const controller = new AbortController();
    const [destination, orderedItems] = JSON.parse(quoteKey);
    async function loadQuote() {
      try {
        if (!Array.isArray(destination) || destination.length !== 2 || !destination.every(Number.isFinite)) {
          throw new Error('Choose a delivery address with a location to check delivery.');
        }
        const response = await api.post('/cart/quote', { coordinates: destination }, { signal: controller.signal });
        const plan = response.data?.recommended;
        if (!validateQuote(plan, orderedItems)) throw new Error('We couldn’t confirm this total. Please try again.');
        if (current) setQuote({ key: quoteKey, plan });
      } catch (error) {
        if (current) setQuote({ key: quoteKey, error: error.message || 'We couldn’t check delivery. Please try again.' });
      }
    }
    loadQuote();
    return () => {
      current = false;
      controller.abort();
    };
  }, [quoteKey]);

  const plan = quote?.key === quoteKey ? quote?.plan : null;
  const quoteError = quote?.key === quoteKey ? quote?.error : null;

  async function handlePlaceOrder(event) {
    event.preventDefault();
    if (!plan || placingOrder) return;
    if (cart.hasPrescriptionRequiredItems && !selectedPrescriptionId && !prescriptionFile) {
      showToast('Attach a prescription for the medicines in your cart.', 'warning');
      document.getElementById('checkout-prescription')?.focus();
      return;
    }

    const deliveryAddress = selectedAddress ? {
      label: selectedAddress.label,
      street: selectedAddress.street,
      city: selectedAddress.city,
      state: selectedAddress.state,
      pincode: selectedAddress.pincode,
      landmark: selectedAddress.landmark,
      fullAddress: selectedAddress.fullAddress,
      coordinates
    } : {
      label: 'Delivery address',
      street: customStreet.trim(),
      city: customCity.trim(),
      state: customState.trim(),
      pincode: customPincode.trim(),
      fullAddress: `${customStreet.trim()}, ${customCity.trim()}, ${customState.trim()} ${customPincode.trim()}`,
      coordinates
    };
    setPlacingOrder(true);
    try {
      let prescriptionId = selectedPrescriptionId || null;
      if (prescriptionFile) {
        const formData = new FormData();
        formData.append('prescription', prescriptionFile);
        formData.append('patientName', user.name);
        const response = await api.post('/prescriptions/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        const uploaded = response.data?.prescription;
        if (!uploaded?._id) throw new Error('Prescription upload failed. Please try again.');
        prescriptionId = uploaded._id;
        setExistingPrescriptions(previous => [uploaded, ...previous]);
        setSelectedPrescriptionId(uploaded._id);
        setPrescriptionFile(null);
      }
      const response = await api.post('/orders', {
        confirmedTotal: plan.totalOrderValue, deliveryAddress, prescriptionId, paymentMethod: 'COD'
      });
      if (!response.data?.order?._id) throw new Error('Order confirmation unavailable. Check your orders before retrying.');
      showToast('Order placed', 'success');
      refreshCart();
      navigate(`/orders/${response.data.order._id}`);
    } catch (error) {
      setQuoteAttempt(previous => previous + 1);
      showToast(error.message || 'Couldn’t place your order. Please try again.', 'error');
    } finally {
      setPlacingOrder(false);
    }
  }

  if (!cart.items.length) {
    return (
      <div className="basket-page basket-empty">
        {cartLoading ? <p role="status">Loading your cart…</p> : (
          <EmptyState icon={ShoppingBag} title="Your cart is empty" description="Add a medicine before checking out."
            actionLabel="Find medicines" onAction={() => navigate('/medicines')} />
        )}
      </div>
    );
  }

  return (
    <div className="basket-page">
      <Link to="/cart" className="basket-link basket-back"><ArrowLeft size={16} /> Back to cart</Link>
      <div className="basket-page-heading"><h1>Checkout</h1></div>
      <form onSubmit={handlePlaceOrder} className="basket-layout">
        <fieldset disabled={placingOrder} className="basket-fields">
          <section className="basket-panel">
            <h2 className="basket-section-title"><MapPin size={20} /> Delivery address</h2>
            {savedAddresses === null && <p role="status" className="basket-muted">Loading addresses…</p>}
            {addressError && <p role="status" className="basket-muted">Saved addresses are unavailable. Enter your delivery details below.</p>}
            {savedAddresses?.length > 0 && (
              <label className="basket-field">Deliver to
                <select value={addressId} onChange={event => setAddressId(event.target.value)}>
                  {savedAddresses.map(address => (
                    <option key={address._id} value={address._id}>{address.label} · {address.street}</option>
                  ))}
                  <option value="">Use another address in my delivery area</option>
                </select>
              </label>
            )}
            {selectedAddress && <p className="basket-muted">{selectedAddress.fullAddress}</p>}
            {savedAddresses && !selectedAddress?.coordinatesConfirmed && <div>
              {chosenArea && <p className="basket-muted">Delivery area · {chosenArea.address}</p>}
              <LocationPicker label={chosenArea ? 'Change area for this order' : 'Choose delivery area for this order'} onSelect={selectOrderArea} />
            </div>}
            {savedAddresses && !selectedAddress && (
              <div className="basket-address">
                <label className="basket-field">House number and street
                  <input autoComplete="address-line1" required pattern=".*\S.*" value={customStreet} onChange={event => setCustomStreet(event.target.value)} />
                </label>
                <div className="basket-address-row">
                  <label className="basket-field">City
                    <input autoComplete="address-level2" required pattern=".*\S.*" value={customCity} onChange={event => {
                      setCustomCity(event.target.value);
                      if (chosenArea && chosenArea.city !== 'Current Area') setOrderArea(null);
                    }} />
                  </label>
                  <label className="basket-field">State
                    <input autoComplete="address-level1" required pattern=".*\S.*" value={customState} onChange={event => setCustomState(event.target.value)} />
                  </label>
                  <label className="basket-field">PIN code
                    <input autoComplete="postal-code" inputMode="numeric" required pattern="[0-9]{6}" maxLength={6}
                      title="Enter a six-digit PIN code" value={customPincode} onChange={event => setCustomPincode(event.target.value)} />
                  </label>
                </div>
              </div>
            )}
          </section>

          {showPrescription ? (
            <section className="basket-panel" aria-labelledby="checkout-prescription">
              <h2 id="checkout-prescription" tabIndex={-1} className="basket-section-title"><FileCheck size={20} />
                {cart.hasPrescriptionRequiredItems ? 'Prescription required' : 'Prescription (optional)'}
              </h2>
              {cart.hasPrescriptionRequiredItems && <p className="basket-muted">A pharmacist will review your prescription before dispensing these medicines.</p>}
              {prescriptionError && <p role="status" className="basket-muted">Saved prescriptions are unavailable. You can upload a file below.</p>}
              {existingPrescriptions.length > 0 && (
                <label className="basket-field">Prescription to attach
                  <select value={selectedPrescriptionId} onChange={event => {
                    setSelectedPrescriptionId(event.target.value);
                    setPrescriptionFile(null);
                  }}>
                    <option value="">Upload a file</option>
                    {existingPrescriptions.map(rx => <option key={rx._id} value={rx._id}>
                      {rx.originalName || rx.doctorName || 'Digital prescription'}
                    </option>)}
                  </select>
                </label>
              )}
              {!selectedPrescriptionId && <FileUpload label="Upload prescription" onFileSelect={setPrescriptionFile} />}
            </section>
          ) : (
            <button type="button" className="basket-link basket-optional" onClick={() => setOptionalPrescription(true)}>
              <FileCheck size={16} /> Attach a prescription (optional)
            </button>
          )}
          <section className="basket-panel basket-payment">
            <Banknote size={22} aria-hidden="true" />
            <div><h2>Payment</h2><p>Cash on delivery</p></div>
          </section>
        </fieldset>

        <aside className="basket-panel basket-summary" aria-labelledby="checkout-summary">
          <h2 id="checkout-summary">Order summary</h2>
          {plan ? (
            <>
              {Number.isFinite(plan.etaMinutes) && <p className="basket-detail-note"><Clock size={17} /> Estimated delivery in {plan.etaMinutes} min</p>}
              <details className="basket-breakdown">
                <summary>Medicines ({cart.totalItems})</summary>
                <ul>{plan.pharmacies[0].itemsFulfilled.map(line => (
                  <li className="basket-price-row" key={line.medicineId}>
                    <span>{line.name} × {line.requestedQty}</span><span>₹{line.totalPrice.toLocaleString('en-IN')}</span>
                  </li>
                ))}</ul>
              </details>
              <dl className="basket-bill">
                <div><dt>Medicines</dt><dd>₹{plan.priceBreakdown.itemsSubtotal.toLocaleString('en-IN')}</dd></div>
                <div><dt>Delivery</dt><dd>₹{plan.priceBreakdown.deliveryFee.toLocaleString('en-IN')}</dd></div>
                <div><dt>Packaging &amp; handling</dt><dd>₹{plan.priceBreakdown.platformFee.toLocaleString('en-IN')}</dd></div>
                <div className="basket-total"><dt>Total payable</dt><dd>₹{plan.totalOrderValue.toLocaleString('en-IN')}</dd></div>
              </dl>
            </>
          ) : (
            <div role="status">
              <p className="basket-muted">{quoteError || (savedAddresses && !coordinates ? 'Choose a delivery area to see your total.' : 'Checking stock and delivery for your address…')}</p>
              {quoteError && <button type="button" className="basket-link" onClick={() => setQuoteAttempt(previous => previous + 1)}>Try again</button>}
            </div>
          )}
          <Button type="submit" fullWidth size="lg" loading={placingOrder} disabled={!plan}>
            {placingOrder ? 'Placing order…' : 'Place order'}
          </Button>
        </aside>
      </form>
    </div>
  );
};

export default Checkout;
