import React, { useEffect, useRef, useState } from 'react';
import NotificationBell from './NotificationBell';
import NotificationList from './NotificationList';

// Bell + dropdown panel, shared by every role layout's header.
const NotificationDropdown = ({ dark = false }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <NotificationBell onClick={() => setOpen((o) => !o)} dark={dark} />
      {open && <NotificationList onClose={() => setOpen(false)} />}
    </div>
  );
};

export default NotificationDropdown;
