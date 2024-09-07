const Joi = require('joi');
interface TransactionItemDetail {
  service: string;
  service_name: string;
  qty: number;
}

export interface Transaction {
  id: string;
  customer: string;
  duration: string;
  customer_name: string;
  duration_name: string;
  status: 'Diproses' | 'Selesai' | 'Siap Diambil';
  items?: TransactionItemDetail[];
  total?: number;
}


export const transactionSchema = Joi.object({
  customer: Joi.string()
    .uuid()
    .required(),

  duration: Joi.string()
    .uuid()
    .required(),

  status: Joi.string()
    .valid('Diproses', 'Selesai', 'Siap Diambil')
    .required(),

  items: Joi.array()
    .items(
      Joi.object({
        service: Joi.string()
          .uuid()
          .required(),

        qty: Joi.number()
          .integer()
          .positive()
          .required()
      })
    )
    .required()
});

export const transactionUpdateSchema = Joi.object({
  status: Joi.string()
    .required()
});
