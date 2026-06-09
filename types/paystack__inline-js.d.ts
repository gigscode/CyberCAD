declare module '@paystack/inline-js' {
  interface TransactionOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    reference?: string;
    label?: string;
    metadata?: Record<string, unknown>;
    callback_url?: string;
    onSuccess?: (transaction: { reference: string; status: string }) => void;
    onCancel?: () => void;
    onError?: (error: Error) => void;
  }

  class PaystackPop {
    newTransaction(options: TransactionOptions): void;
    cancelTransaction(): void;
  }

  export default PaystackPop;
}
