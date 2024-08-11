import Joi from "joi";

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
  

// Define the Joi schema
export const durationSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama wajib diisi',
  }),
  duration: Joi.number().required().messages({
    'number.base': 'Durasi harus berupa angka',
    'number.empty': 'Durasi wajib diisi',
  }),
  type: Joi.string().valid('Hari', 'Jam').required().messages({
    'any.only': 'Tipe tidak valid',
    'string.empty': 'Tipe wajib diisi',
  }),
});
