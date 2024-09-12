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
export interface TransactionData {
  id: string;
  customer: string;
  payment_status: string;
  invoice: string;
  status: 'Diproses' | 'Selesai' | 'Siap Diambil';
  created_at: Date;
  ready_to_pick_up_at: Date | null;
  completed_at: Date | null;
}

export interface ServiceDetail {
  service_id: string;
  service_name: string;
  price: number;
  quantity: number;
}

export interface TransactionDetails {
  id: string;
  customer: string;
  customer_name: string;
  customer_phone_number: string;
  duration_name: string;
  total: number;
  payment_id: number;
  payment_status: string;
  invoice: string;
  services: ServiceDetail[];
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
