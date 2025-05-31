export interface ValidationResult {
  isValid: boolean;
  error?: {
    message: string;
    element: object;
  };
}
