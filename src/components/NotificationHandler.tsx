"use client";

import { useEffect, useState } from 'react';

interface Notification {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

export default function NotificationHandler() {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleNotification = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { type, message } = customEvent.detail;

      setNotification({ type, message });
      setIsVisible(true);

      // Auto-hide after 7 seconds
      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => setNotification(null), 300); // Wait for fade out
      }, 7000);
    };

    window.addEventListener('show-notification', handleNotification);

    return () => {
      window.removeEventListener('show-notification', handleNotification);
    };
  }, []);

  if (!notification) return null;

  const colors = {
    success: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-300',
    error: 'from-red-500/20 to-pink-500/20 border-red-500/30 text-red-300',
    warning: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-300',
    info: 'from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300',
  };

  const icons = {
    success: (
      <svg className="h-6 w-6 text-green-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg className="h-6 w-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    warning: (
      <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg className="h-6 w-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
      </svg>
    ),
  };

  return (
    <div
      className={`fixed top-4 right-4 z-[200] max-w-md transition-all duration-300 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'
      }`}
    >
      <div className={`rounded-lg bg-gradient-to-br ${colors[notification.type]} border p-4 shadow-2xl backdrop-blur-sm`}>
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">{icons[notification.type]}</div>
          <div className="flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => setNotification(null), 300);
            }}
            className="flex-shrink-0 text-gray-400 hover:text-white transition"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
