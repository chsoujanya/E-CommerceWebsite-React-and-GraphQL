const { ApolloServer, gql } = require("apollo-server-express");
const express = require('express');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");
const mysql = require("mysql2/promise");
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); 
const { GraphQLString } = require('graphql');
const { graphqlHTTP } = require('express-graphql');

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "Accolite@4477",
  database: "online_shopping"
});

const app = express();
app.use(cors());

const typeDefs = gql`
  type User {

    username: String
    email: String
    password: String
    user_address: String
  }

  
  type Product {
    product_id: Int!
    product_name: String
    product_price: Float
    product_description: String
    image: String
  }
  type CartItem {
    user_id: Int!
    product_id: Int!
    quantity: Int!
    order_id: Int
    product: Product
  }
  type Order {
    order_id: Int
    user_id: Int
    order_status: String
    order_address: String
    order_total: Float
  }
  
  type Query {
    users: [User]
    products: [Product]
    getCartItems(user_id: Int!): [CartItem]
    getCartTotal(user_id: Int!): Float 
    getUser(user_id: Int!): User
    getOrdersByUserId(user_id: Int!): [Order]  
    
    
  }
  type Mutation {
    registerUser(username: String!, email: String!, password: String!, user_address: String!): User
    loginUser(email: String!, password: String!): String!
    addToCart(user_id: Int!, product_id: Int!, quantity: Int!): String
    placeOrder(
      user_id: Int!,
      order_status: String!,
      order_address: String!, 
      order_total: Float!
    ): Order
    deleteCartItem(user_id: Int!, product_id: Int!): String
  }
`;



const resolvers = {
  Query: {
    users: async () => {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute("SELECT * FROM users");
        return rows;
      } finally {
        connection.release();
      }
    },
    

    
    products: async () => {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute("SELECT * FROM products");
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
    
  },
  Mutation: {
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
    
    
  },
  CartItem: {
    product: async (parent, _, { pool }) => {
      const connection = await pool.getConnection();
      try {
        const [rows] = await connection.execute('SELECT * FROM products WHERE product_id = ? ', [parent.product_id]);
        return rows[0];
      } finally {
        connection.release();
      }
    },
  },
  
    
  
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground
  ],
  context:{
    pool
  }
});

async function startServer() {
  await server.start();

  server.applyMiddleware({ app });

  const PORT = process.env.PORT || 4000;
  const serverInstance = app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}${server.graphqlPath}`);
  });
  serverInstance.on('error', (error) => {
    console.error('Server error:', error);
  });
}

startServer();