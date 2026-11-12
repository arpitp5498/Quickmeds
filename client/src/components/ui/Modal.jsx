import React, { useId, useLayoutEffect, useRef } from 'react';
import { X } from 'lucide-react';

const widths = { sm: '400px', md: '540px', lg: '720px', xl: '900px' };

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md', closeOnBackdrop = true }) {
  const dialog = useRef(null);
  const titleId = useId();

  useLayoutEffect(() => {
    if (!isOpen) return;
    const element = dialog.current;
    element.showModal();
    return () => element.close();
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <dialog ref={dialog} className="app-modal" aria-labelledby={titleId}
      style={{ maxWidth: widths[size] || widths.md }}
      onCancel={event => {
        if (event.target === dialog.current) { event.preventDefault(); onClose(); }
      }}
      onClick={event => { if (closeOnBackdrop && event.target === dialog.current) onClose(); }}>
      <div className="app-modal-panel">
        <header><h2 id={titleId}>{title}</h2>
          <button type="button" aria-label="Close modal" onClick={onClose}><X size={20} /></button>
        </header>
        <div className="app-modal-body">{children}</div>
        {footer && <div className="app-modal-footer">{footer}</div>}
      </div>
    </dialog>
  );
}
