export interface PaymentInput {
  transaction_id: string;
  status: "Belum Dibayar" | "Lunas";
  total_amount_due: number;
  invoice_id: string;
}

export interface Payment {
  id: string;
  transaction_id: string;
  status: "Belum Dibayar" | "Lunas";
  total_amount_due: string;
  invoice_id: string;
  payment_received: string;
  change_given: string;
}


export interface Service {
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
}

export interface PaymentDetails {
  paymentId: string;
  invoice: string;
  total: number;
  paymentStatus: string;
  services: Service[];
}
