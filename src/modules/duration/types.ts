export enum DurationType {
    Hari = 'Hari',
    Jam = 'Jam',
  }
  
  export interface Duration {
    id: string;
    name: string;
    duration: number;
    type: DurationType;
  }
  