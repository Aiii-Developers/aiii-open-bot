import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { ApolloServer, gql } from 'apollo-server-express';
import coldStart from './functions/cold-start';


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
const typeDefs = gql`
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
    ranger: String
    me: User
  }
`;

// Provide resolver functions for your schema fields
const resolvers = {
    Query: {
        hello: () => 'Hello world!',
        ranger: () => 'ranger!!',
        me: (parent: any, args: any, context: any) => {
            console.log(parent, args, context);
            return users[0];
        },
    },
};

const server = new ApolloServer({ typeDefs, resolvers });


const app = express();

app.use(cors({ origin: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true,
}));
const router = express.Router();
app.use('/', router); // https://api-dnz3lqp74q-an.a.run.app/**
app.use('/api', router); // https://s.aiii.ai/api/**
router.get('/', coldStart); // 喚醒

server.applyMiddleware({ app });

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`);
});
