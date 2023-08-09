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

  type Query {
    users: [User]
  }

  type Mutation {
    registerUser(username: String!, email: String!, password: String!, user_address: String!): User
    loginUser(email: String!, password: String!): String
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
    }
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

        const token = jwt.sign({ userId: user.user_id }, 'your-secret-key', { expiresIn: '1h' });
        return token;

      } finally {
        connection.release();
      }
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [
    ApolloServerPluginLandingPageGraphQLPlayground
  ]
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