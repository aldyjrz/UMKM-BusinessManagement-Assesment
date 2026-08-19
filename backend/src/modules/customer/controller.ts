import { Request, Response, NextFunction } from "express";
import customerService from "./service";
import { sendSuccess, sendError } from "../../utils/response";

class CustomerController {
  async createCustomer(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const customer = await customerService.createCustomer(req.body);
      return sendSuccess(res, "Customer created", customer.toJSON(), 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getAllCustomers(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { type, active } = req.query;
      const customers = await customerService.getAllCustomers({
        type: type as string,
        active: active !== undefined ? active !== "false" : undefined
      });
      return sendSuccess(res, "Customers retrieved", customers);
    } catch (error) {
      return sendError(res, "Failed to get customers", 500);
    }
  }

  async getCustomerById(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const customer = await customerService.getCustomerById(parseInt(id));
      if (!customer) {
        return sendError(res, "Customer not found", 404);
      }
      return sendSuccess(res, "Customer retrieved", customer.toJSON());
    } catch (error) {
      return sendError(res, "Failed to get customer", 500);
    }
  }

  async updateCustomer(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const customer = await customerService.updateCustomer(parseInt(id), req.body);
      return sendSuccess(res, "Customer updated", customer.toJSON());
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async deleteCustomer(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      await customerService.deleteCustomer(parseInt(id));
      return sendSuccess(res, "Customer deleted", {});
    } catch (error) {
      return sendError(res, (error as Error).message, 404);
    }
  }
}

export default new CustomerController();







