import React, { useEffect, useState } from 'react';
import { Link, useLocation as useRouteLocation, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, MapPin, Pill, ShieldCheck } from 'lucide-react';
import api from '../../services/api';
import { useLocation } from '../../context/LocationContext';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { getMedicineImage, showMedicineImagePlaceholder } from '../../utils/medicineImages';
import { MedicineFacts, MedicinePurchase, useMedicineCart } from './MedicinePurchase';
import './medicine-shop.css';

export default function MedicineDetail() {
  const { id } = useParams();
  const { location } = useLocation();
  const route = useRouteLocation();
  const catalogUrl = route.state?.catalogUrl || '/medicines';
  const basket = useMedicineCart();
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    setStatus('loading');
    api.get(`/medicines/${id}`, { params: { lat: location.lat, lng: location.lng }, signal: controller.signal }).then(res => {
      if (controller.signal.aborted) return;
      if (!res.success || !res.data?.medicine) throw new Error('Invalid medicine response');
      setData(res.data);
      setStatus('ready');
    }).catch(() => { if (!controller.signal.aborted) setStatus('error'); });
    return () => controller.abort();
  }, [id, location.lat, location.lng, retry]);

  const medicine = data?.medicine;
  return (
    <div className="container med-shop">
      <Link className="med-back" to={catalogUrl}><ArrowLeft size={17} />Back to medicines</Link>
      {status === 'loading' ? <div role="status" aria-label="Loading medicine details"><Skeleton height="330px" /></div> :
        status === 'error' ? <EmptyState icon={Pill} title="Medicine details unavailable" description="We couldn’t confirm the details for this medicine." actionLabel="Try again" onAction={() => setRetry(r => r + 1)} /> : (
          <article className="med-detail">
            <div className="med-image med-detail-image"><img src={getMedicineImage(medicine)} onError={showMedicineImagePlaceholder} alt={medicine.name} /></div>
            <div className="med-detail-content">
              <h1>{medicine.name}</h1>
              <p className="med-meta">{[medicine.strength, medicine.dosageForm].filter(Boolean).join(' · ')}</p>
              <p className={medicine.requiresPrescription ? 'med-rx' : 'med-meta'}>{medicine.requiresPrescription ? 'Prescription required at checkout' : 'Over the counter'}</p>
              <p className="med-address"><MapPin size={16} />Delivery to {location.address}</p>
              <MedicinePurchase medicine={medicine} basket={basket} />
              {data.promotion && medicine.lowestPrice === data.promotion.promotionalPrice && <p className="med-promo">{data.promotion.name} · {data.promotion.discountPercentage}% off MRP</p>}
              {basket.getItemQuantity(medicine._id) > 0 && <Link className="med-link" to="/cart">View cart ({basket.totalItems}) <ArrowRight size={16} /></Link>}
              <p className="med-meta">Your final price and delivery estimate are confirmed in checkout.</p>
              <details className="med-disclosure"><summary>Product information</summary><MedicineFacts medicine={medicine} /></details>
              <p className="med-safety"><ShieldCheck size={19} aria-hidden="true" /><span>Your pharmacist makes the final dispensing decision. Do not self-medicate.</span></p>
            </div>
          </article>
        )}
    </div>
  );
}
