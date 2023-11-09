---
title: React Context with useReducer and Typescript.
status: published
publishedAt: 2020-03-22
description: Context API with action and reducers strongly typed.
slug: context-use-reducer-typescript
---

[Just the code?](https://codesandbox.io/s/context-reducer-ts-9ctis)

There are many options to handle state in react applications. Obviously you can use `setState` for some small logic, but what if you have a complex state to manage?

Maybe you will use Redux or MobX to handle this scenario, but there is also the option to use React Context, and you don't have to install another dependency.

Let's see how we can manage a complex state, with the Context API and Typescript. 

> In this tutorial we are building, a product list with a shopping cart counter.

First, create a new React project with `create-react-app`.

```bash
npx create-react-app my-app --template typescript
cd my-app/
```

Next, create a new `context.tsx` file inside the `src` directory.

```javascript
/*context.tsx*/

import React, { createContext } from 'react';

const AppContext = createContext({});
```

You can initialize a context api as simple as that, with any value you want, in this case, I'm using an empty object.

Now let's create an initial state, with an empty list of products and the shopping cart counter to zero. Also, let's add some types for this.

```tsx
/*context.tsx*/

import React, { createContext } from 'react';

type ProductType = {
  id: number;
  name: string;
  price: number;
}

type InitialStateType = {
  products: ProductType[];
  shoppingCart: number;
}

const initialState = {
  products: [],
  shoppingCart: 0,
}

const AppContext = createContext<InitialStateType>(initialState);
```

Every product inside the product list is going to have an id, name, and price.

Now we will use reducers and actions to create and delete a product, and also increase the shopping cart counter by one. First, create a new file called `reducers.ts`.

```typescript
/*reducers.ts*/

export const productReducer = (state, action) => {
  switch (action.type) {
    case 'CREATE_PRODUCT':
      return [
        ...state,
        {
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
        }
      ]
    case 'DELETE_PRODUCT':
      return [
        ...state.filter(product => product.id !== action.payload.id),
      ]
    default:
      return state;
  }
}

export const shoppingCartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_PRODUCT':
      return state + 1;
  }
}
```

A reducer function receives two arguments, the first one is the state, that we are passing when using `useReducer` hook, and the second one is an object that represents that events and some data that will change the state (action).

In this case, we create two reducers, one is for the products, and the other one for the shopping cart. On the product reducer, we add two actions, one for creating a new product and the other one to delete any product. For the shopping cart reducer, the only action we add is to increase the counter every time you add a new product.

As you can see, for creating a product we pass, the id, the name, and the price, and return our current state, with the new object. For deleting one, we just need and id and the return is the state but without the product that has this id.

Now let's change the context file to import these reducer functions.

```tsx
/*context.tsx*/

import React, { createContext, useReducer } from 'react';
import { productReducer, shoppingCartReducer } from './reducers';

type ProductType = {
  id: number;
  name: string;
  price: number;
}

type InitialStateType = {
  products: ProductType[];
  shoppingCart: number;
}

const intialState = {
  products: [],
  shoppingCart: 0,
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = ({ products, shoppingCart }, action) => ({
  products: productReducer(products, action),
  shoppingCart: shoppingCartReducer(shoppingCart, action),
});

const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  )
}

export { AppContext, AppProvider };
```

There's is a `mainReducer` function, that combines the two reducers that we are going to have (product reducer and shopping cart reducer), each one manages a select part of the state.

Also, we create the `AppProvider` component, and inside this, the `useReducer` hook takes this `mainReducer` and the initial state to return the `state` and the `dispatch`.

We pass these values into the `AppContext.Provider`, doing this we can access the `state` and `dispatch` with the `useContext` hook.

Next, add these types for the reducers and actions. 

```typescript
/*reducers.ts*/

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? {
        type: Key;
      }
    : {
        type: Key;
        payload: M[Key];
      }
};

export enum Types {
  Create = 'CREATE_PRODUCT',
  Delete = 'DELETE_PRODUCT',
  Add = 'ADD_PRODUCT',
}

// Product

type ProductType = {
  id: number;
  name: string;
  price: number;
}

type ProductPayload = {
  [Types.Create] : {
    id: number;
    name: string;
    price: number;
  };
  [Types.Delete]: {
    id: number;
  }
}

export type ProductActions =
  ActionMap<ProductPayload>[keyof ActionMap<ProductPayload>];

export const productReducer = (
  state: ProductType[],
  action: ProductActions | ShoppingCartActions
) => {
  switch (action.type) {
    case Types.Create:
      return [
        ...state,
        {
          id: action.payload.id,
          name: action.payload.name,
          price: action.payload.price,
        }
      ]
    case Types.Delete:
      return [
        ...state.filter(product => product.id !== action.payload.id),
      ]
    default:
      return state;
  }
}

// ShoppingCart

type ShoppingCartPayload = {
  [Types.Add]: undefined;
}

export type ShoppingCartActions =
  ActionMap<ShoppingCartPayload>[keyof ActionMap<ShoppingCartPayload>];

export const shoppingCartReducer = (
  state: number,
  action: ProductActions | ShoppingCartActions
) => {
  switch (action.type) {
    case Types.Add:
      return state + 1;
    default:
      return state;
  }
}
```

I take this approach from this [post](https://medium.com/hackernoon/finally-the-typescript-redux-hooks-events-blog-you-were-looking-for-c4663d823b01), basically we are checking wich `action.type` is used, and according to that, we generate the types for the payload. 

---

**NOTE**

Another approach you can take is to use `Discriminated unions` like this.

```typescript
type Action =
 | { type: 'ADD' }
 | { type: 'CREATE', create: object }
 | { type: 'DELETE', id: string };
```

In the previous code, all of those types have a common property called type. Typescript will create type guards for discriminated unions and will let us now according to the type we are using wich other properties the object type has.

But for this tutorial we are using two common properties for our actions `type` and `payload`, and the `payload` object type changes according to the `type`, so discriminated union types won't work.

---

Now, let's import the types we define into the `context`  file.

```tsx
/*context.tsx*/

import React, { createContext, useReducer, Dispatch } from 'react';
import {
  productReducer,
  shoppingCartReducer,
  ProductActions, 
  ShoppingCartActions 
} from './reducers';

type ProductType = {
  id: number;
  name: string;
  price: number;
}

type InitialStateType = {
  products: ProductType[];
  shoppingCart: number;
}

const initialState = {
  products: [],
  shoppingCart: 0,
}

const AppContext = createContext<{
  state: InitialStateType;
  dispatch: Dispatch<ProductActions | ShoppingCartActions>;
}>({
  state: initialState,
  dispatch: () => null
});

const mainReducer = (
  { products, shoppingCart }: InitialStateType,
  action: ProductActions | ShoppingCartActions
) => ({
  products: productReducer(products, action),
  shoppingCart: shoppingCartReducer(shoppingCart, action),
});


const AppProvider: React.FC = ({ children }) => {
  const [state, dispatch] = useReducer(mainReducer, initialState);

  return (
    <AppContext.Provider value={{state, dispatch}}>
      {children}
    </AppContext.Provider>
  )
}

export { AppProvider, AppContext };
```

Don't forget to wrap your main component with the `AppProvider`.

```tsx
/* App.tsx */

import React from 'react';
import { AppProvider } from './context';
import Products from './products';

const App = () => {
  <AppProvider>
    // your stuff
    <Products />
  </AppProvider>
}

export default App
```

Create a `Products` component and inside this add the following code.

```tsx
/* Products.tsx */

import React, { useContext } from 'react';
import { AppContext } from './context';
import { Types } from './reducers';

const Products = () => {
  const { state, dispatch } = useContex(AppContext);
  
  return (
    <div>
      <button onClick={() => {
        dispatch({
          type: Types.Add,
        })
      }}>
        click
        </button>
      {state.shoppingCart}
    </div>
  )
}

export default Products;
```

Everything it's strongly typed now.

You can check the code [here](https://codesandbox.io/s/context-reducer-ts-9ctis).



#### Sources.

https://medium.com/hackernoon/finally-the-typescript-redux-hooks-events-blog-you-were-looking-for-c4663d823b01