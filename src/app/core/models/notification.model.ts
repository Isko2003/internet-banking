export type NotificationType = 'transaction' | 'info' | 'card' | 'security';
export interface AppNotification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  date: string;
  type: NotificationType;
}
