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
    'string.empty': 'Name is required',
  }),
  email: Joi.string().email().messages({
    'string.email': 'Invalid Email',
  }),
  address: Joi.string().allow(''), // Address is not required
  phone_number: Joi.string().pattern(/^[+]?[0-9]{10,15}$/).required().messages({
    'string.pattern.base': 'Invalid phone number',
  }),
  gender: Joi.string().valid('Laki-laki', 'Perempuan').required().messages({
    'any.only': 'Invalid gender',
    'string.empty': 'Gender is required',
  }),
});

