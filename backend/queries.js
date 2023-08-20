const pool = require('./db');
const queries = {
    getProductReviews: async (_, { product_id }, { pool }) => {
        const connection = await pool.getConnection();
        try {
            console.log("reviews")
          const connection = await pool.getConnection();
          const [rows] = await connection.execute(
            'SELECT * FROM review WHERE product_id = ?',
            [product_id]
          );
          
          return rows;
        } finally {
          connection.release();
        }
      },
      users: async () => {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.execute("SELECT * FROM users");
          return rows;
        } finally {
          connection.release();
        }
      },
      
      
      checkUserExistence: async (_, { email, username }, { pool }) => {
        const connection = await pool.getConnection();
        try {
            console.log("login")
          const [rows] = await connection.execute(
            'SELECT * FROM users WHERE email = ? OR username = ?',
            [email, username]
          );
          return rows.length > 0;
        } finally {
          connection.release();
        }
      },
      
    
    
    
      
    
    
      products: async (_, { category }, { pool }) => {
        const connection = await pool.getConnection();
        try {
            console.log("products")
          let query = "SELECT * FROM products";
          let params = [];
          
          if (category) {
            query += " WHERE category = ?";
            params.push(category);
          }
    
          const [rows] = await connection.execute(query, params);
          return rows;
        } finally {
          connection.release();
        }
      },
    
    
      
    
    
      getCartTotal: async (_, { user_id }) => {
        
        const connection = await pool.getConnection();
        try {
    
         
          
          
          
          const [rows] = await connection.execute(
            "SELECT c.quantity, p.product_price FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ? AND c.order_id IS NULL",
            [user_id]
          );
    
          
          if(rows.length === 0){
            return 0;
          }
    
          const cartTotal = rows.reduce((total, row) => {
            return total + row.quantity * row.product_price;
          }, 0);
          
    
          return cartTotal;
        } finally {
          connection.release();
        }
      },
      getCartItems: async (_, { user_id }) => {
        const connection = await pool.getConnection();
        try {
            console.log("cartitems")
          
          const [rows] = await connection.execute(
            "SELECT c.user_id, c.product_id, c.quantity, p.* FROM cart c JOIN products p ON c.product_id = p.product_id WHERE c.user_id = ? AND c.order_id IS NULL",
            [user_id]
          );
          
          return rows;
        } finally {
          connection.release();
        }
      },
      
    
      getUser: async (_, { user_id }) => {
        const connection = await pool.getConnection();
        try {
          
          const [rows] = await connection.execute(
            "SELECT user_id, username, email, user_address from users WHERE user_id = ?", [user_id],
            [user_id]
          );
          
          return rows[0];
        } finally {
          connection.release();
        }
      },
    
      getOrdersByUserId: async (_, { user_id }) => {
        const connection = await pool.getConnection();
        try {
          const [rows] = await connection.execute(
            'SELECT * FROM orders WHERE user_id = ?',
            [user_id]
          );
    
          
          return rows;
        } finally {
          connection.release();
        }
      },
}


module.exports = queries;
