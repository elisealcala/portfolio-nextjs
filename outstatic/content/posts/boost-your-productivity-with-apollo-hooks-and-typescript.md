---
title: Boost your productivity with apollo hooks and typescript.
status: published
slug: boost-your-productivity-with-apollo-hooks-and-typescript
description: Generate types with apollo codegen.
publishedAt: 2020-06-27T13:19:02.635Z
---
In a world where Typescript is becoming an essential part (almost required) of many web applications, it's very useful to know how to use it with the many libraries that are in our current stack. 

If you work on a React app which already uses Typescript, and you also use Apollo, this guide will help to start using Typescript with it, to take advantage of the beautiful work of static typing.

## Start our project.

Let's configure apollo in our new app.

```bash
yarn add apollo-boost @apollo/react-hooks apollo
```

Now let's create our Apollo client and use it with the React application.

On the `App.tsx` add the following code.

```tsx
import React from 'react';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from '@apollo/react-hooks';
import './App.css';

const client = new ApolloClient({
  uri: 'https://rickandmortyapi.com/graphql',
});

function App() {
  return (
    <ApolloProvider client={client}>
      <h1>
        Rick and Morty App
      </h1>
    </ApolloProvider>
  );
}

export default App;
```

## Write some queries.

Now that we configured Apollo in our app, let's write some queries to get the data from the API.

Let's create a new file called `queries.ts`  on the root of the project and add our first query to get the characters.

```typescript
import { gql } from 'apollo-boost';

export const CHARACTERS_QUERY = gql`
  query charactersQuery(
    $page: Int,
    $name: String,
    $status: String,
    $species: String,
    $type: String,
    $gender: String
  ) {
    characters(
      page: $page,
      filter: {
        name: $name,
        status: $status,
        species: $species,
        type: $type,
        gender: $gender
      }) 
    {
      info {
        count
        pages
        next
        prev
      }
      results {
        id
        name
        status
        species
        type
        gender
        image
      }
    }
  }
`;
```

The query above has some variables to filter the characters and to paginate the list, look the fields inside `results`, those fields are the one who belongs to the character, there are a few more, but those are most relevant for now.

Now, create a new filled called `Characters.tsx`, this is where we will use the query and make the request.

```typescript
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { CHARACTERS_QUERY } from './queries'

const Characters = () => {
  const { data } = useQuery(CHARACTERS_QUERY);

  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}

export default Characters;
```

Let's break down this to understand it better.

- **useQuery**   According to Apollo documentation, this is the primary API for executing queries in an Apollo application, you don't need a High Order Component anymore, just use `useQuery` and it will return an object that contains `loading`, `error`, and `data` properties.

- **charactersQuery**  This is the query we write before, you passed it to the `useQuery` hook and it will return the data.

Import this new `Characters` component into the  `App`, and you will see the data from all the characters.

## Generate Types.

This is my favorite part, you can generate the types for the queries, this will highly increase your productivity writing code,   **apollo codegen** is a tool that allows us to do exactly that.

Previously we installed the `apollo` library so now we are going to create a configuration file `apollo.config.js` on the root of the project.

```json
module.exports = {
  client: {
    service: {
      url: 'https://rickandmortyapi.com/graphql',
    },
    includes: ['./src/**/*.{ts,tsx,js,jsx,graphql}'],
  },
};
```

Let's also include a new script on the `package.json` to run it and generate the types.

```json
"scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "apollo:codegen": "apollo client:codegen --tagName=gql --target=typescript types",
    "eject": "react-scripts eject"
  },
```

The **tagName** flag is the name of the template literal tag used, in this case, is `gql`, the **target** is the type of code generator to use, the final **types** is the output, the new folder when all the types are going to be.

Check the [documentation](https://github.com/apollographql/apollo-tooling#apollo-clientcodegen-output) to know what other options you can set.

So now you are ready to run `yarn run apollo:codegen ` on the console and see what happens.

![Terminal](https://dev-to-uploads.s3.amazonaws.com/i/fsl9gdr5vqzwnevh5j1a.png)

Check your project and you should see two new folders, we only need the one with the `charactersQuery.ts` file inside.

## Using the types with hooks.

Let's go back to the `Characters` component, now that we have the types generated the next part is straightforward.

```tsx
import React from 'react';
import { useQuery } from '@apollo/react-hooks';
import { CHARACTERS_QUERY } from './queries';
import { charactersQuery, charactersQueryVariables } from './types/charactersQuery';

const Characters = () => {
  const { data } = useQuery<charactersQuery, charactersQueryVariables>(CHARACTERS_QUERY);
  
  return (
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )
}

export default Characters;
```

Import those types and include it on the `useQuery` hook, and now you're ready to go.

![Code](https://dev-to-uploads.s3.amazonaws.com/i/y8nrg23b7qjlhqyamnx9.png)

Since we already included the types for the variables, if you tried, this will throw an error.

```tsx
const { data, loading } = useQuery<charactersQuery, charactersQueryVariables>(CHARACTERS_QUERY, {
    variables: {
      page: "12",
    }
  });
```

`Type 'string' is not assignable to type 'number | null | undefined'.ts(2322)`

## Conclusion

Generally, I tried to use Typescript for all my projects and having the types for the queries and mutations saved me a lot of time, I hope you find it useful.