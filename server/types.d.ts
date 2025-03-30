declare module 'connect-mysql';

// Extend session namespace to include SessionStore
declare namespace Express {
  namespace session {
    interface SessionStore {
      get: (sid: string, callback: (err: any, session?: any) => void) => void;
      set: (sid: string, session: any, callback?: (err?: any) => void) => void;
      destroy: (sid: string, callback?: (err?: any) => void) => void;
    }
  }
}