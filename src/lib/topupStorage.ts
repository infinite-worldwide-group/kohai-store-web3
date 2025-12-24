import type { PaymentSession } from '@/types/topup';

// Shared in-memory storage for payment sessions
// In production, replace this with a database (PostgreSQL, MongoDB, etc.)
// Use global to persist across hot reloads in development
const globalForSessions = global as unknown as {
  topupSessions: Map<string, PaymentSession> | undefined;
};

export const sessions = globalForSessions.topupSessions ?? new Map<string, PaymentSession>();

if (process.env.NODE_ENV !== 'production') {
  globalForSessions.topupSessions = sessions;
}

console.log('📦 Topup storage module loaded. Current sessions:', sessions.size);

// Helper function to get a session
export function getSession(sessionId: string): PaymentSession | undefined {
  console.log(`🔍 Getting session: ${sessionId}`);
  console.log(`📊 Total sessions in storage: ${sessions.size}`);
  console.log(`🗂️ All session IDs:`, Array.from(sessions.keys()));
  const session = sessions.get(sessionId);
  console.log(`${session ? '✅' : '❌'} Session ${sessionId} ${session ? 'found' : 'not found'}`);
  return session;
}

// Helper function to save a session
export function saveSession(session: PaymentSession): void {
  console.log(`💾 Saving session: ${session.sessionId}`);
  sessions.set(session.sessionId, session);
  console.log(`✅ Session saved. Total sessions: ${sessions.size}`);
  console.log(`🗂️ All session IDs after save:`, Array.from(sessions.keys()));
}

// Helper function to update a session
export function updateSession(sessionId: string, updates: Partial<PaymentSession>): PaymentSession | null {
  const session = sessions.get(sessionId);
  if (!session) return null;

  const updatedSession = { ...session, ...updates };
  sessions.set(sessionId, updatedSession);
  return updatedSession;
}

// Helper function to delete a session
export function deleteSession(sessionId: string): boolean {
  return sessions.delete(sessionId);
}

// Helper function to get all sessions (for debugging)
export function getAllSessions(): PaymentSession[] {
  return Array.from(sessions.values());
}

// Clean up expired sessions periodically
export function cleanupExpiredSessions(): number {
  const now = new Date();
  let cleaned = 0;

  sessions.forEach((session, sessionId) => {
    if (now > session.expiresAt && session.status !== 'completed') {
      session.status = 'expired';
      sessions.set(sessionId, session);
      cleaned++;
    }
  });

  return cleaned;
}

// Run cleanup every 5 minutes
if (typeof window === 'undefined') {
  setInterval(() => {
    const cleaned = cleanupExpiredSessions();
    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired sessions`);
    }
  }, 5 * 60 * 1000);
}
