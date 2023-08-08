const express = require("express");
const app = express();
const { graphqlHTTP } = require("express-graphql");

const {
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} = require("graphql");  // Fixed typo: changed 'reauired' to 'require'

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({  // Fixed typo: changed 'qyery' to 'query'
    name: "OnlineShoppingWebsite",  // Changed name to a valid GraphQL name
    fields: {
      message: {
        type: GraphQLString,
        resolve: () => "Hello",
      },
    },
  }),
});

app.use("/graphql", graphqlHTTP({
    schema: schema,
    graphiql: true,
  })
);

app.listen(8081, () => {
  console.log("Server is running on port 8081");
});