import { createContext, useContext } from 'react';

export interface ValidationContextValue {
  nodeErrors: Record<string, string[]>;
}

export const ValidationContext = createContext<ValidationContextValue>({ nodeErrors: {} });
export const useValidation = () => useContext(ValidationContext);
