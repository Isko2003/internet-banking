export interface ToastMessage {
  id: number;
  message: string;
  variant: 'success' | 'error' | 'info';
}
