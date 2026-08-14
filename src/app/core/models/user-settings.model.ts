export interface UserSettings {
  id: number;
  userId: number;
  language: 'az' | 'en';
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
  balanceHidden: boolean;
  inactivityTimeoutMinutes: number;
  twoFactorEnabled: boolean;
}
