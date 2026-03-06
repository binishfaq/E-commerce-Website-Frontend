// backend/src/controllers/adminController.js
import { query, getOne, insert } from '../utils/db.js';

// ========== DASHBOARD STATS ==========
export const getDashboardStats = async (req, res) => {
  try {
    // Get total products
    const [productsResult] = await query('SELECT COUNT(*) as total FROM products');
    
    // Get total orders
    const [ordersResult] = await query('SELECT COUNT(*) as total FROM orders');
    
    // Get total users
    const [usersResult] = await query('SELECT COUNT(*) as total FROM users');
    
    // Get total revenue (sum of all delivered orders)
    const [revenueResult] = await query(
      'SELECT SUM(total) as total FROM orders WHERE status = "Delivered"'
    );

    // Get total categories
    const [categoriesResult] = await query('SELECT COUNT(*) as total FROM categories');

    // Get recent orders (last 5)
    const recentOrders = await query(
      `SELECT o.*, u.email, u.firstName, u.lastName 
       FROM orders o
       JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC LIMIT 5`
    );

    // Get low stock products (stock < 10)
    const lowStock = await query(
      `SELECT * FROM products WHERE stock < 10 ORDER BY stock ASC LIMIT 5`
    );

    // Get pending orders count
    const [pendingResult] = await query(
      `SELECT COUNT(*) as total FROM orders WHERE status IN ('Processing', 'Confirmed', 'Shipped')`
    );

    res.json({
      stats: {
        products: productsResult.total || 0,
        orders: ordersResult.total || 0,
        users: usersResult.total || 0,
        revenue: revenueResult.total || 0,
        categories: categoriesResult.total || 0,
        pendingOrders: pendingResult.total || 0
      },
      recentOrders,
      lowStock
    });

  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== PRODUCT MANAGEMENT ==========
export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const category = req.query.category || '';

    let sql = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (search) {
      sql += ' AND (name LIKE ? OR brand LIKE ? OR description LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }

    // Get total count first
    let countSql = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const countParams = [...params];

    const [totalResult] = await query(countSql, countParams);
    const total = totalResult.total;

    // Add pagination
    sql += ' ORDER BY id DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const products = await query(sql, params);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getOne('SELECT * FROM products WHERE id = ?', [id]);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const { name, brand, category, description, price, stock, image } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }

    const result = await insert(
      `INSERT INTO products (name, brand, category, description, price, stock, image) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, brand || '', category || '', description || '', price, stock || 0, image || '']
    );

    const newProduct = await getOne('SELECT * FROM products WHERE id = ?', [result]);

    res.status(201).json({
      message: 'Product added successfully',
      product: newProduct
    });

  } catch (error) {
    console.error('Error adding product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, brand, category, description, price, stock, image } = req.body;

    await query(
      `UPDATE products 
       SET name = ?, brand = ?, category = ?, description = ?, price = ?, stock = ?, image = ?
       WHERE id = ?`,
      [name, brand, category, description, price, stock, image, id]
    );

    const updatedProduct = await getOne('SELECT * FROM products WHERE id = ?', [id]);

    res.json({ 
      message: 'Product updated successfully',
      product: updatedProduct 
    });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if product exists in orders
    const orders = await query('SELECT id FROM order_items WHERE productId = ?', [id]);
    if (orders.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete product that has been ordered' 
      });
    }

    await query('DELETE FROM products WHERE id = ?', [id]);
    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== CATEGORY MANAGEMENT ==========
export const getAllCategories = async (req, res) => {
  try {
    const categories = await query('SELECT * FROM categories ORDER BY name');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const addCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    // Check if category already exists
    const existing = await getOne('SELECT id FROM categories WHERE name = ?', [name]);
    if (existing) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const result = await insert(
      'INSERT INTO categories (name, description) VALUES (?, ?)',
      [name, description || '']
    );

    const newCategory = await getOne('SELECT * FROM categories WHERE id = ?', [result]);

    res.status(201).json({
      message: 'Category added successfully',
      category: newCategory
    });

  } catch (error) {
    console.error('Error adding category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    await query(
      'UPDATE categories SET name = ?, description = ? WHERE id = ?',
      [name, description, id]
    );

    const updatedCategory = await getOne('SELECT * FROM categories WHERE id = ?', [id]);

    res.json({
      message: 'Category updated successfully',
      category: updatedCategory
    });

  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if category is used by products
    const products = await query('SELECT id FROM products WHERE category = (SELECT name FROM categories WHERE id = ?)', [id]);
    if (products.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete category that has products' 
      });
    }

    await query('DELETE FROM categories WHERE id = ?', [id]);
    res.json({ message: 'Category deleted successfully' });

  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== ORDER MANAGEMENT ==========
export const getAllOrders = async (req, res) => {
  try {
    const orders = await query(
      `SELECT o.*, u.email, u.firstName, u.lastName, u.phone
       FROM orders o
       JOIN users u ON o.userId = u.id
       ORDER BY o.createdAt DESC`
    );

    // Get items for each order
    const ordersWithItems = await Promise.all(
      orders.map(async (order) => {
        const items = await query(
          `SELECT oi.*, p.name, p.image 
           FROM order_items oi
           JOIN products p ON oi.productId = p.id
           WHERE oi.orderId = ?`,
          [order.id]
        );
        return { ...order, items };
      })
    );

    res.json(ordersWithItems);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const order = await getOne(
      `SELECT o.*, u.email, u.firstName, u.lastName, u.phone, u.address, u.city, u.province
       FROM orders o
       JOIN users u ON o.userId = u.id
       WHERE o.id = ?`,
      [id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [id]
    );

    res.json({ ...order, items });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Processing', 'Confirmed', 'Shipped', 'Delivered', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    
    const updatedOrder = await getOne('SELECT * FROM orders WHERE id = ?', [id]);

    res.json({ 
      message: 'Order status updated',
      order: updatedOrder 
    });

  } catch (error) {
    console.error('Error updating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== USER MANAGEMENT ==========
export const getAllUsers = async (req, res) => {
  try {
    const users = await query(
      `SELECT id, firstName, lastName, email, phone, isAdmin, createdAt 
       FROM users ORDER BY id DESC`
    );
    res.json(users);

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await getOne(
      'SELECT id, firstName, lastName, email, phone, address, city, province, isAdmin, createdAt FROM users WHERE id = ?',
      [id]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's order count
    const [orderCount] = await query('SELECT COUNT(*) as total FROM orders WHERE userId = ?', [id]);

    res.json({
      ...user,
      orderCount: orderCount.total
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user is the only admin
    const user = await getOne('SELECT isAdmin FROM users WHERE id = ?', [id]);
    if (user && user.isAdmin) {
      const adminCount = await getOne('SELECT COUNT(*) as total FROM users WHERE isAdmin = true');
      if (adminCount.total <= 1) {
        return res.status(400).json({ 
          message: 'Cannot delete the only admin user' 
        });
      }
    }

    // Check if user has orders
    const orders = await query('SELECT id FROM orders WHERE userId = ?', [id]);
    if (orders.length > 0) {
      return res.status(400).json({ 
        message: 'Cannot delete user with existing orders' 
      });
    }

    await query('DELETE FROM users WHERE id = ?', [id]);
    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ========== DASHBOARD CHARTS DATA ==========
export const getChartData = async (req, res) => {
  try {
    // Get orders by status for pie chart
    const ordersByStatus = await query(
      `SELECT status, COUNT(*) as count 
       FROM orders 
       GROUP BY status`
    );

    // Get monthly sales for line chart (last 6 months)
    const monthlySales = await query(
      `SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, 
              COUNT(*) as orders,
              SUM(total) as revenue
       FROM orders 
       WHERE status = 'Delivered'
         AND createdAt >= DATE_SUB(NOW(), INTERVAL 6 MONTH)
       GROUP BY DATE_FORMAT(createdAt, '%Y-%m')
       ORDER BY month DESC`
    );

    // Get top selling products
    const topProducts = await query(
      `SELECT p.id, p.name, p.image, 
              SUM(oi.quantity) as total_sold,
              SUM(oi.price * oi.quantity) as revenue
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       JOIN orders o ON oi.orderId = o.id
       WHERE o.status = 'Delivered'
       GROUP BY p.id
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    res.json({
      ordersByStatus,
      monthlySales,
      topProducts
    });

  } catch (error) {
    console.error('Error fetching chart data:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};