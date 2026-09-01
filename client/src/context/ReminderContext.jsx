import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { initAudioContext, playReminderChime, stopChime } from '../utils/reminderSound';
import ReminderAlertOverlay from '../components/common/ReminderAlertOverlay';

const ReminderContext = createContext();

// localStorage key helpers for duplicate prevention
const TRIGGERED_PREFIX = 'qm_triggered_';

function getTodayDateKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function getTriggeredKey(reminderId, time) {
  return `${TRIGGERED_PREFIX}${getTodayDateKey()}_${reminderId}_${time}`;
}

function isAlreadyTriggered(reminderId, time) {
  return localStorage.getItem(getTriggeredKey(reminderId, time)) === '1';
}

function markAsTriggered(reminderId, time) {
  localStorage.setItem(getTriggeredKey(reminderId, time), '1');
}

/** Clean up triggered keys from previous days */
function cleanupOldTriggeredKeys() {
  const todayKey = getTodayDateKey();
  const keysToRemove = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(TRIGGERED_PREFIX) && !key.includes(todayKey)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach(k => localStorage.removeItem(k));
}

export const ReminderProvider = ({ children }) => {
  const { user, isCustomer, isAuthenticated } = useAuth();

  const [reminders, setReminders] = useState([]);
  const [todaySchedule, setTodaySchedule] = useState([]);
  const [activeAlert, setActiveAlert] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  const fetchIntervalRef = useRef(null);
  const checkIntervalRef = useRef(null);
  const autoDismissRef = useRef(null);
  const triggeredSessionSet = useRef(new Set());

  // ─── Audio Context Unlock ───────────────────────────────────
  // Initialize AudioContext on first user interaction (click/keydown/touch)
  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return;

    const unlockAudio = () => {
      initAudioContext();
      setAudioUnlocked(true);
      // Remove listeners after first interaction
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };

    document.addEventListener('click', unlockAudio, { once: false, passive: true });
    document.addEventListener('keydown', unlockAudio, { once: false, passive: true });
    document.addEventListener('touchstart', unlockAudio, { once: false, passive: true });

    return () => {
      document.removeEventListener('click', unlockAudio);
      document.removeEventListener('keydown', unlockAudio);
      document.removeEventListener('touchstart', unlockAudio);
    };
  }, [isAuthenticated, isCustomer]);

  // ─── Fetch Reminders ────────────────────────────────────────
  const fetchReminders = useCallback(async () => {
    if (!isAuthenticated || !isCustomer) return;
    try {
      const res = await api.get('/reminders');
      if (res.success && res.data) {
        setReminders(res.data.reminders || []);
        setTodaySchedule(res.data.todaySchedule || []);
      }
    } catch (err) {
      // Silently fail — don't break UX for background polling
      console.warn('[ReminderContext] Fetch failed:', err.message);
    }
  }, [isAuthenticated, isCustomer]);

  // Initial fetch + periodic re-fetch every 5 minutes
  useEffect(() => {
    if (!isAuthenticated || !isCustomer) {
      setReminders([]);
      setTodaySchedule([]);
      return;
    }

    // Cleanup old triggered keys from previous days
    cleanupOldTriggeredKeys();

    fetchReminders();
    fetchIntervalRef.current = setInterval(fetchReminders, 5 * 60 * 1000);

    return () => {
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
    };
  }, [isAuthenticated, isCustomer, fetchReminders]);

  // ─── Check Due Reminders (every 30 seconds) ────────────────
  const checkDueReminders = useCallback(() => {
    if (!reminders.length || activeAlert) return;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const currentDay = now.getDay();

    for (const reminder of reminders) {
      if (!reminder.isActive) continue;
      if (!reminder.daysOfWeek || !reminder.daysOfWeek.includes(currentDay)) continue;

      // Check date range
      if (reminder.startDate) {
        const start = new Date(reminder.startDate);
        start.setHours(0, 0, 0, 0);
        if (now < start) continue;
      }
      if (reminder.endDate) {
        const end = new Date(reminder.endDate);
        end.setHours(23, 59, 59, 999);
        if (now > end) continue;
      }

      for (const timing of reminder.timings) {
        if (timing.time !== currentTime) continue;

        // Duplicate prevention: session Set + localStorage
        const dupeKey = `${reminder._id}_${timing.time}`;
        if (triggeredSessionSet.current.has(dupeKey)) continue;
        if (isAlreadyTriggered(reminder._id, timing.time)) continue;

        // 🔔 TRIGGER ALERT
        triggeredSessionSet.current.add(dupeKey);
        markAsTriggered(reminder._id, timing.time);

        setActiveAlert({
          reminderId: reminder._id,
          medicineName: reminder.medicineName,
          dosage: reminder.dosage,
          time: timing.time,
          label: timing.label || 'Scheduled',
          notes: reminder.notes
        });

        // Try to play chime
        try {
          playReminderChime();
        } catch (e) {
          console.warn('[ReminderContext] Chime playback failed:', e);
        }

        // Auto-dismiss after 60 seconds if user doesn't interact
        autoDismissRef.current = setTimeout(() => {
          dismissAlert();
        }, 60000);

        return; // Only one alert at a time
      }
    }
  }, [reminders, activeAlert]);

  useEffect(() => {
    if (!isAuthenticated || !isCustomer) return;

    // Check immediately on mount / reminders change
    checkDueReminders();

    checkIntervalRef.current = setInterval(checkDueReminders, 30000);

    return () => {
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [isAuthenticated, isCustomer, checkDueReminders]);

  // ─── Dismiss Alert ──────────────────────────────────────────
  const dismissAlert = useCallback(() => {
    stopChime();
    setActiveAlert(null);
    if (autoDismissRef.current) {
      clearTimeout(autoDismissRef.current);
      autoDismissRef.current = null;
    }
  }, []);

  // ─── Test Reminder Sound (Demo) ─────────────────────────────
  const testReminderSound = useCallback(() => {
    // Dismiss any existing alert first
    if (activeAlert) {
      dismissAlert();
    }

    setActiveAlert({
      reminderId: 'demo-test',
      medicineName: 'Dolo 650mg (Test)',
      dosage: '1 tablet',
      time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false }),
      label: 'Demo',
      notes: 'This is a test reminder sound.'
    });

    try {
      playReminderChime();
    } catch (e) {
      console.warn('[ReminderContext] Test chime failed:', e);
    }

    // Auto-dismiss test after 12 seconds
    autoDismissRef.current = setTimeout(() => {
      dismissAlert();
    }, 12000);
  }, [activeAlert, dismissAlert]);

  // ─── Cleanup on unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      stopChime();
      if (fetchIntervalRef.current) clearInterval(fetchIntervalRef.current);
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
      if (autoDismissRef.current) clearTimeout(autoDismissRef.current);
    };
  }, []);

  return (
    <ReminderContext.Provider
      value={{
        reminders,
        todaySchedule,
        activeAlert,
        fetchReminders,
        dismissAlert,
        testReminderSound,
        audioUnlocked
      }}
    >
      {children}
      {/* Global overlay — renders when activeAlert is set */}
      {activeAlert && (
        <ReminderAlertOverlay
          alert={activeAlert}
          onDismiss={dismissAlert}
          audioUnlocked={audioUnlocked}
        />
      )}
    </ReminderContext.Provider>
  );
};

export const useReminders = () => {
  const context = useContext(ReminderContext);
  if (!context) {
    throw new Error('useReminders must be used within a ReminderProvider');
  }
  return context;
};
