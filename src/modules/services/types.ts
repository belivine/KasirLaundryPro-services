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
  satuan: string; // Unit of measurement
  durations: Duration[];
}

export const serviceSchema = Joi.object({
  name: Joi.string().required(),
  satuan: Joi.string().required(),
  durations: Joi.array()
    .items(
      Joi.object({
        duration: Joi.string().required(), // Expecting duration_id for input
        price: Joi.number().integer().min(0).required(), // Price for the duration
      })
    )
    .required(),
});
