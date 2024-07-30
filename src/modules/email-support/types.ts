import Joi from "joi";

export const emailSupportSchema = Joi.object({
    title: Joi.string().required(),
    message: Joi.string().required()
  });
  