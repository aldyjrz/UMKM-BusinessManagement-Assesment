import  Customer  from "../../models/Customer.js";
import  User  from "../../models/User.js";
import logger from "../../utils/logger.js";

export interface CustomerInput {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postal_code: string;
  type?: "GUEST" | "REGISTERED";
  user_id?: number | null;
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const existing = await Customer.findOne({ where: { email: input.email } });
  if (existing) {
    throw new Error("Customer with this email already exists");
  }

  const customer = await Customer.create({
    user_id: input.user_id || null,
    name: input.name,
    email: input.email,
    phone: input.phone,
    address: input.address,
    city: input.city,
    postal_code: input.postal_code,
    type: input.type || "REGISTERED"
  });

  logger.info("Customer created", { customerId: customer.id, email: customer.email });
  return customer;
}

export async function getAllCustomers(filters?: { type?: string; active?: boolean }): Promise<Customer[]> {
  const where: any = {};
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.active !== undefined) {
    where.is_active = filters.active;
  }

  return Customer.findAll({ where, order: [["created_at", "DESC"]] });
}

export async function getCustomerById(id: number): Promise<Customer | null> {
  return Customer.findByPk(id, {
    include: [{ model: User, as: "user", attributes: ["id", "email", "name", "role"] }]
  });
}

export async function updateCustomer(id: number, input: Partial<CustomerInput>): Promise<Customer> {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    throw new Error("Customer not found");
  }

  await customer.update(input);
  return customer;
}

export async function deleteCustomer(id: number): Promise<void> {
  const customer = await Customer.findByPk(id);
  if (!customer) {
    throw new Error("Customer not found");
  }

  await customer.destroy();
}

const customerService = {
  createCustomer,
  getAllCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer
};

export default customerService;




