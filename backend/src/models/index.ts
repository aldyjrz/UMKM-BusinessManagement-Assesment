import sequelize from "../config/database";
import User from "./User";
import OAuthAccount from "./OAuthAccount";
import Customer from "./Customer";
import Category from "./Category";
import Supplier from "./Supplier";
import Product from "./Product";
import Order from "./Order";
import OrderItem from "./OrderItem";
import Payment from "./Payment";
import StockMovement from "./StockMovement";
import Income from "./Income";
import Expense from "./Expense";

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



