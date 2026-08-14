export interface PaymentCategoryConfig {
  key: string;
  label: string;
  icon: string;
}

export const PAYMENT_CATEGORIES: PaymentCategoryConfig[] = [
  { key: 'mobile', label: 'Mobil ödəniş', icon: '📱' },
  { key: 'internet', label: 'İnternet', icon: '🌐' },
  { key: 'utilities', label: 'Kommunal', icon: '💡' },
  { key: 'fines', label: 'Cərimələr', icon: '🚔' },
  { key: 'education', label: 'Təhsil', icon: '🎓' },
];
