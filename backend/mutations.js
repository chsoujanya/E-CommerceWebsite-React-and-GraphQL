const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('./db');
const mutations = {
    registerUser: async (_, { username, email, password, user_address }) => {
        const connection = await pool.getConnection();
        try {
          const hashedPassword = await bcrypt.hash(password, 10);
          await connection.execute(
            "INSERT INTO users (username, email, password, user_address) VALUES (?, ?, ?, ?)",
            [username, email, hashedPassword, user_address]
          );
          return { username, email, user_address };
        } finally {
          connection.release();
        }
      },
      loginUser: async (_, { email, password }) => {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.execute("SELECT * FROM users WHERE email = ?", [email]);
          if (rows.length === 0) {
            throw new Error('User not found');
          }
  
          const user = rows[0];
  
          const isPasswordValid = await bcrypt.compare(password, user.password);
          if (!isPasswordValid) {
            throw new Error('Invalid password');
          }
          const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';
          console.log(secretKey)
          const token = jwt.sign({ user_id: user.user_id,username:user.username }, secretKey, { expiresIn: '24h' });
          return  token;
  
        } finally {
          connection.release();
        }
      },
      addToCart: async (_, { user_id, product_id, quantity }) => {
        const connection = await pool.getConnection();
        try {
          
          const [existingItem] = await connection.execute(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ? AND order_id IS NULL",
            [user_id, product_id]
          );
  
          if (existingItem.length > 0) {
            await connection.execute(
              "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
              [quantity, user_id, product_id]
            );
          } 
          else {
            
            await connection.execute(
              "INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)",
              [user_id, product_id, quantity]
            );
          }
  
          return 'Product added to cart';
        } finally {
          connection.release();
        }
      
      },
      
      
      placeOrder: async (_, {user_id,
        order_status,
        order_address, 
        order_total},{pool}) => {
        try {
          const connection = await pool.getConnection();
          const [result] = await connection.execute(
            'INSERT INTO orders (user_id, order_status, order_address, order_total) VALUES (?, ?, ?, ?)',
            [user_id, order_status, order_address, order_total]
          );
  
          const order_id = result.insertId;
  
          const [result1] = await connection.execute(
            'UPDATE cart SET order_id =  ? WHERE user_id = ?',
            [order_id, user_id]
          );
          
  
          connection.release();
          return {
            user_id,
            order_id,
            order_status,
            order_address,
            order_total
          };
        } catch (error) {
          throw new UserInputError('Failed to place order');
        }
      },
      deleteCartItem: async (_, { user_id, product_id }) => {
        const connection = await pool.getConnection();
        try {
          await connection.execute(
            'DELETE FROM cart WHERE user_id = ? AND product_id = ?',
            [user_id, product_id]
          );
          return 'Cart item deleted successfully';
        } catch (error) {
          throw new Error('Failed to delete cart item');
        } finally {
          connection.release();
        }
      },
};

module.exports = mutations;