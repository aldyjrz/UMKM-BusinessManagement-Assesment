import Product from "../../models/Product";
import Category from "../../models/Category";
import Supplier from "../../models/Supplier";
import StockMovement, { MovementType } from "../../models/StockMovement";
import { sequelize } from "../../models";
import { Op } from "sequelize";

import n8nService from "../../integrations/n8n/n8nClient";
import logger from "../../utils/logger";

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  stock: number;
  minimum_stock: number;
  category_id?: number;
  supplier_id?: number;
  image?: string;
  status: "ACTIVE" | "INACTIVE";
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const existing = await Product.findOne({ where: { sku: input.sku } });
  if (existing) {
    throw new Error("Product with this SKU already exists");
  }

  const product = await Product.create(input as any);
  logger.info("Product created", { productId: product.id, sku: product.sku });
  return product;
}

export async function getAllProducts(filters?: {
  status?: string;
  categoryId?: number;
  search?: string;
  lowStock?: boolean;
}): Promise<Product[]> {
  const where: any = {};
  if (filters?.status) {
    where.status = filters.status;
  }
  if (filters?.categoryId) {
    where.category_id = filters.categoryId;
  }
  if (filters?.search) {
    where[Op.or] = [
      { name: { [Op.like]: `%${filters.search}%` } },
      { sku: { [Op.like]: `%${filters.search}%` } }
    ];
  }
  if (filters?.lowStock) {
    where.stock = { [Op.lte]: sequelize.col("minimum_stock") };
  }

  return Product.findAll({
    where,
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] },
      { model: Supplier, as: "supplier", attributes: ["id", "name"] }
    ]
  });
}

export async function getProductById(id: number): Promise<Product | null> {
  return Product.findByPk(id, {
    include: [
      { model: Category, as: "category", attributes: ["id", "name"] },
      { model: Supplier, as: "supplier", attributes: ["id", "name"] }
    ]
  });
}

export async function updateProduct(id: number, input: Partial<ProductInput>): Promise<Product> {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new Error("Product not found");
  }

  await product.update(input as any);
  return product;
}

export async function deleteProduct(id: number): Promise<void> {
  const product = await Product.findByPk(id);
  if (!product) {
    throw new Error("Product not found");
  }

  await product.destroy();
}

export async function getAllStockMovements(filters?: {
  type?: string;
  productId?: number;
  limit?: number;
  offset?: number;
}): Promise<StockMovement[]> {
  const where: any = {};
  if (filters?.type) {
    where.type = filters.type;
  }
  if (filters?.productId) {
    where.product_id = filters.productId;
  }

  return StockMovement.findAll({
    where,
    limit: filters?.limit,
    offset: filters?.offset,
    include: [{ model: Product, as: "product", attributes: ["id", "name", "sku"] }],
    order: [["created_at", "DESC"]]
  });
}

export async function createStockAdjustment(
  productId: number,
  newQuantity: number,
  notes?: string
): Promise<{ product: Product; movement: StockMovement }> {
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      throw new Error("Product not found");
    }

    const oldQuantity = product.stock;
    const diff = newQuantity - oldQuantity;

    await product.update({ stock: newQuantity }, { transaction: t });

    const movement = await StockMovement.create(
      {
        product_id: product.id,
        type: MovementType.ADJUSTMENT,
        quantity: Math.abs(diff),
        stock_before: oldQuantity,
        stock_after: newQuantity,
        reference_type: "ADJUSTMENT",
        notes: notes || `Stock adjusted from ${oldQuantity} to ${newQuantity}`
      },
      { transaction: t }
    );

    await t.commit();

    if (newQuantity <= product.minimum_stock) {
      await n8nService.triggerLowStockNotification({
        productId: product.id,
        productName: product.name,
        currentStock: newQuantity,
        minimumStock: product.minimum_stock
      });
    }

    logger.info("Stock adjustment created", { productId, oldQuantity, newQuantity, diff });

    return { product, movement };
  } catch (error) {
    await t.rollback();
    logger.error("Stock adjustment failed", { productId, error: (error as Error).message });
    throw error;
  }
}

export async function createPurchase(productId: number, quantity: number, notes?: string): Promise<{ product: Product; movement: StockMovement }> {
  const t = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction: t });
    if (!product) {
      throw new Error("Product not found");
    }

    const oldStock = product.stock;
    const newStock = oldStock + quantity;

    await product.update({ stock: newStock }, { transaction: t });

    const movement = await StockMovement.create(
      {
        product_id: product.id,
        type: MovementType.PURCHASE,
        quantity: quantity,
        stock_before: oldStock,
        stock_after: newStock,
        reference_type: "PURCHASE",
        notes: notes || `Purchase of ${quantity} units`
      },
      { transaction: t }
    );

    await t.commit();

    logger.info("Purchase stock movement created", { productId, quantity });

    return { product, movement };
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

export async function getInventorySummary(): Promise<{
  totalProducts: number;
  totalStockValue: number;
  lowStockProducts: number;
  categories: number;
  suppliers: number;
  totalMovements: number;
}> {
  const results = await Promise.all([
    Product.count(),
    Product.findAll({ attributes: [[sequelize.fn("SUM", sequelize.col("price")), "total"]] }),
    Product.count({ where: { stock: { [Op.lte]: sequelize.col("minimum_stock") } } }),
    Category.count(),
    Supplier.count(),
    StockMovement.count()
  ]);

  return {
    totalProducts: results[0],
    totalStockValue: parseFloat((results[1][0] as any)?.total || "0"),
    lowStockProducts: results[2],
    categories: results[3],
    suppliers: results[4],
    totalMovements: results[5]
  };
}

const inventoryService = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getAllStockMovements,
  createStockAdjustment,
  createPurchase,
  getInventorySummary
};

export default inventoryService;




