

export interface INITIAL_TYPE {
  loading: boolean;
  success: boolean;
  error: boolean;
  errorData: any;
  execute: () => Promise<void>;
}