export interface PaymentInput {
  transaction_id: string;
  status: "Belum Dibayar" | "Lunas" | "Sebagian" | "Ditolak";
  total_amount_due: number;
  invoice_id: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  status: "Belum Dibayar" | "Lunas" | "Sebagian" | "Ditolak";
  total_amount_due: string;
  invoice_id: string;
  payments_received: string;
  change_given: string;
}
