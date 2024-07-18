export interface Customer {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  address: string;
  gender: 'Laki-laki' | 'Perempuan'; // Added gender field
}
