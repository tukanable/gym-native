import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  overwrite: true,
  schema: 'schema.graphql',
  documents: 'src/**/!(*.generated).{ts,tsx}',
  ignoreNoDocuments: true, // for better experience with the watcher
  generates: {
    './src/generated/types.ts': {
      plugins: ['typescript'],
    },
    './src/': {
      preset: 'near-operation-file',
      presetConfig: {
        extension: '.generated.tsx',
        baseTypesPath: 'generated/types.ts',
      },
      config: {
        withHooks: true,
      },
      plugins: ['typescript', 'typescript-operations', 'typescript-urql'],
    },
    './src/generated/graphql.schema.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
