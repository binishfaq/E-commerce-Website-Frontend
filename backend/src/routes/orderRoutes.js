// backend/src/routes/orderRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { query, insert, getOne } from '../utils/db.js';

const router = express.Router();

// Create new order
router.post('/', protect, async (req, res) => {
  try {
    const {
      items,
      shippingAddress,
      city,
      province,
      postalCode,
      paymentMethod,
      subtotal,
      shipping,
      tax,
      total,
      notes
    } = req.body;

    console.log('📦 Received order request:', req.body);
    console.log('👤 User ID:', req.user.id);

    // Validate
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'No items in order' });
    }

    // Generate unique order number
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);

    try {
      // Insert order - REMOVED updatedAt from the query
      const orderId = await insert(
        `INSERT INTO orders (
          userId, orderNumber, subtotal, shipping, tax, total,
          paymentMethod, shippingAddress, city, province, postalCode,
          notes, status, createdAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          req.user.id,
          orderNumber,
          subtotal || 0,
          shipping || 0,
          tax || 0,
          total || 0,
          paymentMethod || 'Cash on Delivery',
          shippingAddress,
          city,
          province,
          postalCode || '',
          notes || '',
          'Processing'
        ]
      );

      console.log('✅ Order inserted with ID:', orderId);

      // Insert order items and update stock
      for (const item of items) {
        // Insert order item
        await insert(
          `INSERT INTO order_items (orderId, productId, quantity, price) 
           VALUES (?, ?, ?, ?)`,
          [orderId, item.productId, item.quantity, item.price]
        );

        // Update product stock
        await query(
          'UPDATE products SET stock = stock - ? WHERE id = ?',
          [item.quantity, item.productId]
        );
      }

      // Get the created order
      const order = await getOne(
        `SELECT o.*, u.email, u.firstName, u.lastName 
         FROM orders o
         JOIN users u ON o.userId = u.id
         WHERE o.id = ?`,
        [orderId]
      );

      res.status(201).json({
        message: 'Order placed successfully',
        id: orderId,
        orderNumber: orderNumber,
        order: order
      });

    } catch (error) {
      console.error('❌ Error in order transaction:', error);
      throw error;
    }

  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const orders = await query(
      `SELECT o.*, 
              COUNT(oi.id) as itemCount,
              SUM(oi.quantity) as totalItems
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.orderId
       WHERE o.userId = ?
       GROUP BY o.id
       ORDER BY o.createdAt DESC`,
      [req.user.id]
    );

    res.json(orders);

  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single order
router.get('/:id', protect, async (req, res) => {
  try {
    const order = await getOne(
      `SELECT o.*, u.email, u.firstName, u.lastName, u.phone 
       FROM orders o
       JOIN users u ON o.userId = u.id
       WHERE o.id = ? AND o.userId = ?`,
      [req.params.id, req.user.id]
    );

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const items = await query(
      `SELECT oi.*, p.name, p.image 
       FROM order_items oi
       JOIN products p ON oi.productId = p.id
       WHERE oi.orderId = ?`,
      [req.params.id]
    );

    res.json({ ...order, items });

  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;