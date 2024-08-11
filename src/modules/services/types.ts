import Joi from "joi";
// Define the Duration type
export interface Duration {
  id: string;
  duration: number; // Duration in minutes
  duration_name: string; // Name of the duration
  price: number; // Price for the duration
}

// Define the Service type
export interface Service {
  id: string;
  name: string;
  unit: string; // Unit of measurement
  durations: Duration[];
}

export const serviceSchema = Joi.object({
  name: Joi.string().required().messages({
    'string.empty': 'Nama wajib diisi',
  }),
  unit: Joi.string().required().messages({
    'string.empty': 'Satuan wajib diisi',
  }),
  durations: Joi.array()
    .items(
      Joi.object({
        duration: Joi.string().required().messages({
          'string.empty': 'Durasi wajib diisi',
        }), // Expecting duration_id for input
        price: Joi.number().integer().min(0).required().messages({
          'number.base': 'Harga harus berupa angka',
          'number.integer': 'Harga harus berupa bilangan bulat',
          'number.min': 'Harga tidak boleh kurang dari 0',
          'number.empty': 'Harga wajib diisi',
        }), // Price for the duration
      })
    )
    .required().messages({
      'array.base': 'Durasi harus berupa array',
      'array.empty': 'Durasi wajib diisi',
    }),
});
