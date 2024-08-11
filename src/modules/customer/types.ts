import Joi from 'joi';

export interface Customer {
  id: string;
  name: string;
  phone_number?: string;
  email?: string;
  address?: string;
  gender: 'Laki-laki' | 'Perempuan'; // Added gender field
}

// Define the Joi schema
export const customerSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama wajib diisi',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Email tidak valid',
  }),
  address: Joi.string().allow(''), // Alamat tidak wajib diisi
  phone_number: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Nomor telepon tidak valid',
  }),
  gender: Joi.string().valid('Laki-laki', 'Perempuan').required().messages({
    'any.only': 'Jenis kelamin tidak valid',
    'string.empty': 'Jenis kelamin wajib diisi',
  }),
});

