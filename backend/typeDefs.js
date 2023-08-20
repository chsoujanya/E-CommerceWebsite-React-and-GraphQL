const { gql } = require("apollo-server-express");
const typeDefs = gql`
  type User {

    username: String
    email: String
    password: String
    user_address: String
  }

  type Review {
    review_id: Int!
    product_id: Int!
    review: String!
  }

  
  type Product {
    product_id: Int!
    product_name: String
    product_price: Float
    product_description: String
    image: String!
    category: String!
    
  
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
    checkUserExistence(email: String!, username: String!): Boolean 
    getProductReviews(product_id: Int!) : [Review]
    
    
    
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

module.exports = typeDefs