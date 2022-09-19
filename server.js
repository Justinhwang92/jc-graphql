import { ApolloServer, gql } from 'apollo-server';
import fetch from 'node-fetch';

let tweets = [
  {
    id: '1',
    text: 'first tweet',
    userId: '2',
  },
  {
    id: '2',
    text: 'second tweet',
    userId: '1',
  },
];

let users = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Moe',
  },
];

// Construct a schema, using GraphQL schema language (SDL - schema definition language)
const typeDefs = gql`
  type User {
    id: ID!
    firstName: String!
    lastName: String!
    """
    fullName is sum of firstName and lastName as a string
    """
    fullName: String! #dynamic field
  }
  """
  Tweet object represents a resource for a Tweet
  """
  type Tweet {
    id: ID!
    text: String
    author: User!
  }

  # whatever you want user to be able to GET request, you have to put that in type Query
  # GET /api/v1/tweets
  # GET /api/v1/tweets/id
  type Query {
    allMovies: [Movie!]!
    allUsers: [User!]!
    allTweets: [Tweet!]!
    tweet(id: ID!): Tweet
    movie(id: String!): Movie
  }

  # Equivalent to POST, DELETE and PUT
  type Mutation {
    postTweet(text: String!, userId: ID!): Tweet!
    """
    deleteTweet deletes a tweet by id, returns true if successful and false if not
    """
    deleteTweet(id: ID!): Boolean!
  }

  type Movie {
    id: Int!
    url: String!
    imdb_code: String!
    title: String!
    title_english: String!
    title_long: String!
    slug: String!
    year: Int!
    rating: Float!
    runtime: Float!
    genres: [String]!
    summary: String
    description_full: String!
    synopsis: String
    yt_trailer_code: String!
    language: String!
    background_image: String!
    background_image_original: String!
    small_cover_image: String!
    medium_cover_image: String!
    large_cover_image: String!
  }
`;
// ! means required
// tweet(id: ID): Tweet => graphql will see it as tweet(id: ID | null): Tweet | null => return null if tweet is not found
// Making required
// tweet(id: ID!): Tweet!

// resolvers are functions that are called when a query is made
const resolvers = {
  Query: {
    // when requests the specific field inside of Query type, it will run this function
    allTweets() {
      return tweets;
    },
    tweet(_, { id }) {
      return tweets.find((tweet) => tweet.id === id);
    },
    allUsers() {
      return users;
    },
    allMovies() {
      return fetch('https://yts.mx/api/v2/list_movies.json')
        .then((res) => res.json())
        .then((json) => json.data.movies);
    },
    movie(_, { id }) {
      return fetch(`https://yts.mx/api/v2/movie_details.json?movie_id=${id}`)
        .then((res) => res.json())
        .then((json) => json.data.movie);
    },
  },
  Mutation: {
    postTweet(_, { text, userId }) {
      const newTweet = {
        id: tweets.length + 1,
        text,
      };
      tweets.push(newTweet);
      return newTweet;
    },
    deleteTweet(_, { id }) {
      const tweet = tweets.find((tweet) => tweet.id === id);
      if (!tweet) return false;
      tweets = tweets.filter((tweet) => tweet.id !== id);
      return true;
    },
  },
  User: {
    // dynamic field
    fullName({ firstName, lastName }) {
      return `${firstName} ${lastName}`;
    },
  },
  Tweet: {
    author({ userId }) {
      return users.find((user) => user.id === userId);
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema definition and your set of resolvers.
const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
