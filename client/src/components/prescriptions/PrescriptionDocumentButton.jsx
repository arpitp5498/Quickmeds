import React, { useState } from 'react';
import PrescriptionInspectionModal from './PrescriptionInspectionModal';
export default function PrescriptionDocumentButton({ prescription }) {
  const [open, setOpen] = useState(false);
  return <><button type="button" onClick={() => setOpen(true)}>View document</button>
    {open && <PrescriptionInspectionModal isOpen onClose={() => setOpen(false)} prescription={prescription} />}</>;
}
