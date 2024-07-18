export interface Laundry {
  id: string;
  customer: string; // customer UUID
  duration: string; // duration UUID
  qty: number;
  service: string; // service UUID
  status: 'Diproses' | 'Selesai' | 'Siap Diambil'; // status enum
}
