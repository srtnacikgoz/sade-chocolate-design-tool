export * from './agent.types.js';

// Re-export common types for convenience
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}
