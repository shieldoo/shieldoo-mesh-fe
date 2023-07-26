module.exports = {
  schema: 'src/api/graphql/schema.graphqls',
  documents: ['src/api/graphql/**/*.graphql'],
  extensions: {
    languageService: {
      cacheSchemaFileForLookup: true,
    },
    endpoints: {
      default: {
        url: "http://localhost:9000/api/graph",
        headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
      },
    },
  }
};
