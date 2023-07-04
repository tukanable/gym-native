import { buildSchema, graphql } from 'graphql';
import { formatISO, addDays } from 'date-fns';
import { makeExecutableSchema } from '@graphql-tools/schema';
import schemaSource from './generated/schema';

const schema = buildSchema(schemaSource);

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

type Set = {
  id: number;
  moment: string;
  weight: number;
  count: number;
};

const sets: Set[] = [];
const dayCount = 3;

for (let day = 0; day < dayCount; day++) {
  for (let setIdx = 0; setIdx < 3; setIdx++) {
    sets.push({
      id: nextId++,
      moment: formatISO(addDays(new Date(), dayCount - day)),
      weight: 20 + day * 5,
      count: 20 - setIdx * 5,
    });
  }
}

const resolvers: any = {
  Step: {
    sets: () => sets,
  },
  Viewer: {
    programs: () => programs,
  },
  Query: {
    viewer: () => ({}),
    program: (parent: any, { id }: any) => programs.find((p) => p.id === id),
    day: (parent: any, { id }: any) => {
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

const executableSchema = makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});

export const localFetch: any = async (url: any, options: any) => {
  const { query, variables } = JSON.parse(options.body);

  const res = await graphql({
    schema: executableSchema,
    source: query,
    variableValues: variables,
  });

  return {
    headers: {
      get: (name: string) => {
        if (name === 'Content-Type') {
          return 'application/json';
        }

        throw new Error(`unexpected name: ${name}`);
      },
    },
    text: () => JSON.stringify(res),
  };
};
