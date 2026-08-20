import sequelize from "../config/database.js";
import User from "./User.js";
import OAuthAccount from "./OAuthAccount.js";
import Customer from "./Customer.js";
import Category from "./Category.js";
import Supplier from "./Supplier.js";
import Product from "./Product.js";
import Order from "./Order.js";
import OrderItem from "./OrderItem.js";
import Payment from "./Payment.js";
import StockMovement from "./StockMovement.js";
import Income from "./Income.js";
import Expense from "./Expense.js";

const db: any = {
  sequelize,
  User,
  OAuthAccount,
  Customer,
  Category,
  Supplier,
  Product,
  Order,
  OrderItem,
  Payment,
  StockMovement,
  Income,
  Expense
};

export {
  sequelize,
  User,
  OAuthAccount,
  Customer,
  Category,
  Supplier,
  Product,
  Order,
  OrderItem,
  Payment,
  StockMovement,
  Income,
  Expense
};

export default db;



