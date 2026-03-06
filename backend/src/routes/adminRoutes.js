// backend/src/routes/adminRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getAllProducts,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getAllUsers,
  getUserById,
  deleteUser,
  getChartData
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin privileges
router.use(protect, admin);

// ========== DASHBOARD ==========
router.get('/dashboard', getDashboardStats);
router.get('/charts', getChartData);

// ========== PRODUCT MANAGEMENT ==========
router.get('/products', getAllProducts);
router.get('/products/:id', getProductById);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// ========== CATEGORY MANAGEMENT ==========
router.get('/categories', getAllCategories);
router.post('/categories', addCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// ========== ORDER MANAGEMENT ==========
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);

// ========== USER MANAGEMENT ==========
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.delete('/users/:id', deleteUser);

export default router;