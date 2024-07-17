export enum LaundryStatus {
    DiProses = 'Diproses',
    Selesai = 'Selesai',
    SiapDiambil = 'Siap Diambil'
  }
  
  export interface LaundryEntry {
    customer: string;  // Assuming UUID as string
    duration: string;  // Assuming UUID as string
    qty: number;
    service: string;   // Assuming UUID as string
    status: LaundryStatus;
  }
  