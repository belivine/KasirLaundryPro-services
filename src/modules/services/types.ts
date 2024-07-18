export interface Duration {
    id: string;
    price: number;
  }
  
  export interface Service {
    id: string;
    name: string;
    satuan: string;
    durations: Duration[];
  }
  