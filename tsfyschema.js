// allow importing a graphql schema in the react-native environment

const fs = require('fs');

const schema = fs.readFileSync('schema.graphql');

fs.writeFileSync('src/generated/schema.ts', `export default \`${schema}\``);
