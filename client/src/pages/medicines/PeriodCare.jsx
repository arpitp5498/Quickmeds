import React from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';

export default function PeriodCare() {
  const [searchParams] = useSearchParams();
  const catalogueParams = new URLSearchParams(searchParams);
  catalogueParams.set('category', 'Period care & hygiene');

  return <Navigate to={{ pathname: '/medicines', search: catalogueParams.toString() }} replace />;
}
