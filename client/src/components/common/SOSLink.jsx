import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function SOSLink() {
  return (
    <NavLink to="/emergency" className="qm-sos" aria-label="SOS emergency essentials">
      <Zap size={17} aria-hidden="true" /> SOS
    </NavLink>
  );
}
