import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';

export default function EmergencyBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  return (
    <aside className="qm-emergency" aria-label="Medical emergency assistance">
      <Phone size={13} aria-hidden="true" />
      <span>Medical emergency? Call <a href="tel:112">112</a> or <a href="tel:102">102</a> (ambulance).</span>
      <button type="button" onClick={() => setDismissed(true)} aria-label="Dismiss emergency notice"><X size={15} /></button>
    </aside>
  );
}
