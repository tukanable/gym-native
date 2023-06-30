import { ApolloServer } from '@apollo/server';
import { formatISO, addDays } from 'date-fns';
import { startStandaloneServer } from '@apollo/server/standalone';
import * as fs from 'fs';

const typeDefs = fs.readFileSync('../schema.graphql').toString();

let nextId = 1;

const programs = [
  {
    id: nextId++,
    name: 'First Program',
    days: [
      {
        id: nextId++,
        name: 'Day 1',

        steps: [
          {
            id: nextId++,

            exercise: {
              id: nextId++,
              name: 'Squats with a barbell',
            },
          },
        ],
      },
      {
        id: nextId++,
        name: 'Day 2',

        steps: [
          {
            id: nextId++,

            exercise: {
              id: nextId++,
              name: 'Barbell bench press',
            },
          },
        ],
      },
      {
        id: nextId++,
        name: 'Day 3',

        steps: [
          {
            id: nextId++,

            exercise: {
              id: nextId++,
              name: 'Deadlift',
            },
          },
        ],
      },
    ],
  },
];

const sets = [];
const dayCount = 10;

for (let day = 0; day < dayCount; day++) {
  for (let setIdx = 0; setIdx < 10; setIdx++) {
    sets.push({
      id: nextId++,
      moment: formatISO(addDays(new Date(), dayCount - day)),
      weight: 20 + day * 5,
      count: 20 - setIdx * 5,
    });
  }
}

const resolvers = {
  Step: {
    sets: () => sets,
  },
  Viewer: {
    programs: () => programs,
  },
  Query: {
    viewer: () => ({}),
    program: (parent, { id }) => programs.find((p) => p.id === id),
    day: (parent, { id }) => {
      for (let program of programs) {
        for (let day of program.days) {
          if (day.id === id) {
            return day;
          }
        }
      }

      return null;
    },
  },
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
});

console.log(`🚀  Server ready at: ${url}`);
