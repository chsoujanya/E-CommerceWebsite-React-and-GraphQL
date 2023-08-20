const { ApolloServer, gql } = require("apollo-server-express");
const express = require('express');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require("apollo-server-core");

const cors = require('cors');

const { GraphQLString } = require('graphql');
const { graphqlHTTP } = require('express-graphql');
const typeDefs = require('./typeDefs');

const pool = require('./db');
// const { queries } = require("@testing-library/react");

const queries = require('./queries');
const mutations = require("./mutations");

const app = express();
app.use(cors());




const resolvers = {

  Query: queries,
  Mutation: mutations,


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
  context: {
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