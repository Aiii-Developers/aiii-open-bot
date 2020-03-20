"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const apollo_server_express_1 = require("apollo-server-express");
const cold_start_1 = __importDefault(require("./functions/cold-start"));
const users = [
    {
        id: 1,
        name: 'Fong',
        age: 23,
    },
    {
        id: 2,
        name: 'Kevin',
        age: 40,
    },
    {
        id: 3,
        name: 'Mary',
        age: 18,
    },
];
// Construct a schema, using GraphQL schema language
const typeDefs = apollo_server_express_1.gql `
  type User {
    "識別碼"
    id: ID
    "名字"
    name: String
    "年齡"
    age: Int
  }

  type Query {
    hello: String
    fuck: String
    me: User
  }
`;
// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        fuck: () => 'fuck you! asshole!!',
        me: (parent, args, context) => {
            console.log(parent, args, context);
            return users[0];
        },
    },
};
const server = new apollo_server_express_1.ApolloServer({ typeDefs, resolvers });
const app = express_1.default();
app.use(cors_1.default({ origin: true }));
app.use(body_parser_1.default.json());
app.use(body_parser_1.default.urlencoded({
    extended: true,
}));
const router = express_1.default.Router();
app.use('/', router); // https://api-dnz3lqp74q-an.a.run.app/**
app.use('/api', router); // https://s.aiii.ai/api/**
router.get('/', cold_start_1.default); // 喚醒
server.applyMiddleware({ app });
const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`);
});
//# sourceMappingURL=index.js.map