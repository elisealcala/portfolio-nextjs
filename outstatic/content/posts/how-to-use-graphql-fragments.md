---
title: How to use Graphql fragments.
description: DRY your query fields.
status: 'published'
publishedAt: '2020-05-01T12:46:19.542Z'
slug: how-to-use-graphql-fragments
---
Let’s imagine you developing an app and you need a user to login to access some features.  This app has a page when you show a list of all your users and for that, you need to get the user's data in order to render some UI.
Also, if someone clicks on a single user you need to show the data from that particular user.

```graphql
query User {
  user {
    id
    firstName
    lastName
    username
    email
    URL
    thumbnailUrl
    occupation
  }
}

query Users {
  users {
    edges {
      node {
	      id
	      firstName
	      lastName
	      username
	      email
	      url
	      thumbnailUrl
	      occupation
      }
    }
  }
}
```

## How can we avoid writing these fields every time we need the user data?

Fragments are a reusable piece of a query. You can use them to avoid repeating code in some cases. According to the Apollo documentation, one of the principal uses for fragments is *Sharing fields between multiple queries, mutations, or subscriptions*.

> DRY: Don’t Repeat Yourself.

Let’s see how we can use fragments on a `.graphql` file.

```graphql
fragment userAttributes on User {
  id
  firstName
  lastName
  username
  email
  url
  thumbnailUrl
  occupation
}
```

The component after the `on`, in this case `User` is the type we are selecting the fields from. In order to use this fragment in a `graphql` file, we must import it in this way.

```gql
#import "./userFragment.graphql"

query User {
  user {
    ...userAttributes
  }
}

query Users {
  users {
    edges {
      node {
	    ...userAttributes
      }
    } 
  }
}
```

That reducer our code significantly. Let’s see the way to embed the fragments in our queries if we use the `gql` helper.

```js
const userFragment = gql`
  fragment userAttributes on User {
    id
    firstName
    lastName
    username
    email
    url
    thumbnailUrl
    occupation
  }
`;

const userQuery = gql`
  query User {
    user {
      ...userAttributes
    }
  }
  ${userFragment}
`;

const userListQuery = gql`
  query Users {
    users {
      edges {
        node {
	      ...userAttributes
        }
      } 
    }
  }
  ${userFragment}
`;
```

If we need to get more data about the user, it’s as easy as adding new fields to our fragment.