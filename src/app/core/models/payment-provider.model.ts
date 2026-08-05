export type PaymentFieldType = 'text' | 'number' | 'tel';

export interface PaymentFieldConfig {
  key: string;
  label: string;
  type: PaymentFieldType;
  placeholder?: string;
}

export interface PaymentProvider {
  id: number;
  category: string;
  name: string;
  hasDebtCheck: boolean;
  field: PaymentFieldConfig[];
}
