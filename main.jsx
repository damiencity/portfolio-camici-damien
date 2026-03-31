import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import MichaMegret from './micha-megret.jsx';

// Preload hint pour Spline
const link = document.createElement('link');
link.rel = 'preconnect';
link.href = 'https://prod.spline.design';
document.head.appendChild(link);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MichaMegret />
  </StrictMode>
);
