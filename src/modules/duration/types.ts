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
    'string.empty': 'Name is required',
  }),
  duration: Joi.number().required().messages({
    'string.empty': 'Duration is required',
  }),
  type: Joi.string().valid('Hari', 'Jam').required().messages({
    'any.only': 'Invalid type',
    'string.empty': 'Type is required',
  }),
});

