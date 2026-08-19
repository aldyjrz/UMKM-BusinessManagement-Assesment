import { Request, Response, NextFunction } from "express";
import inventoryService from "./service";
import { sendSuccess, sendError } from "../../utils/response";
import Category from "../../models/Category";
import Supplier from "../../models/Supplier";

class InventoryController {
  async createProduct(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const product = await inventoryService.createProduct(req.body);
      return sendSuccess(res, "Product created", product.toJSON(), 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getAllProducts(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { status, categoryId, search, lowStock } = req.query;
      const products = await inventoryService.getAllProducts({
        status: status as string,
        categoryId: categoryId ? parseInt(categoryId as string) : undefined,
        search: search as string,
        lowStock: lowStock === "true"
      });
      return sendSuccess(res, "Products retrieved", products);
    } catch (error) {
      return sendError(res, "Failed to get products", 500);
    }
  }

  async getProductById(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await inventoryService.getProductById(parseInt(id));
      if (!product) {
        return sendError(res, "Product not found", 404);
      }
      return sendSuccess(res, "Product retrieved", product.toJSON());
    } catch (error) {
      return sendError(res, "Failed to get product", 500);
    }
  }

  async updateProduct(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      const product = await inventoryService.updateProduct(parseInt(id), req.body);
      return sendSuccess(res, "Product updated", product.toJSON());
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async deleteProduct(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { id } = req.params;
      await inventoryService.deleteProduct(parseInt(id));
      return sendSuccess(res, "Product deleted", {});
    } catch (error) {
      return sendError(res, (error as Error).message, 404);
    }
  }

  async getAllStockMovements(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { type, productId, limit, offset } = req.query;
      const movements = await inventoryService.getAllStockMovements({
        type: type as string,
        productId: productId ? parseInt(productId as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        offset: offset ? parseInt(offset as string) : undefined
      });
      return sendSuccess(res, "Stock movements retrieved", movements);
    } catch (error) {
      return sendError(res, "Failed to get stock movements", 500);
    }
  }

  async createStockAdjustment(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { productId, quantity, notes } = req.body;
      const result = await inventoryService.createStockAdjustment(productId, quantity, notes);
      return sendSuccess(res, "Stock adjusted", { product: result.product.toJSON(), movement: result.movement.toJSON() });
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async createPurchase(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const { productId, quantity, notes } = req.body;
      const result = await inventoryService.createPurchase(productId, quantity, notes);
      return sendSuccess(res, "Purchase recorded", { product: result.product.toJSON(), movement: result.movement.toJSON() }, 201);
    } catch (error) {
      return sendError(res, (error as Error).message, 400);
    }
  }

  async getInventorySummary(req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const summary = await inventoryService.getInventorySummary();
      return sendSuccess(res, "Inventory summary", summary);
    } catch (error) {
      return sendError(res, "Failed to get inventory summary", 500);
    }
  }

  async getCategories(_req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const categories = await Category.findAll();
      return sendSuccess(res, "Categories retrieved", categories);
    } catch (error) {
      return sendError(res, "Failed to get categories", 500);
    }
  }

  async getSuppliers(_req: Request, res: Response, _next: NextFunction): Promise<Response> {
    try {
      const suppliers = await Supplier.findAll();
      return sendSuccess(res, "Suppliers retrieved", suppliers);
    } catch (error) {
      return sendError(res, "Failed to get suppliers", 500);
    }
  }
}

export default new InventoryController();






