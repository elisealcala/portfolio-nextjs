---
title: 3 Tips to write better react components.
publishedAt: 2020-04-09
description: Get rid of code smells.
slug: tips-write-better-react-components
status: published
---

One of my tasks for this sprint was to implement a new feature in a very complicated form, with dynamic questions and a logic to jump between them. I estimated 5 hours for this task, the only change I need to do, was to add an extra validation at the moment to send.

I was still thinking this until I saw the component I need to update. This component has more than 300 lines of code, there was a giant piece of JSX markup that took like 150 lines, and the logic…, there were many setState in this component and useEffects with many dependencies.

I was surprised and also ashamed because I wrote this code, but it turns out into a giant monster that I don't understand at all. You know, like those times when you are staring at your screen for fifteen minutes thinking what on earth this function was for.

### Code smells
You might hear this before, if you don't, code smells are practically what I describe before. It indicates weakness in your code, they are not bugs, because the web app works fine, but it can increase the risk of bugs or failures in the future.

So, how do you deal with a code like that?

I followed these tips to refactor the component I describe before, and I hope it could help you too.

## useReducer instead of useState

I mentioned that this component has multiple `useState`, this was difficult to read because I have to look for all the `setState` to know which part of the component updates a certain state.

![Pretty bad code](https://dev-to-uploads.s3.amazonaws.com/i/meca3jh9ajq90gr3apj8.png)

Yeah, I know, it looks bad. If you end with a code like this, you must consider doing a refactor. Many of these states where related, so I can create a reducer to handle the possible scenarios for this form.

![A better approach with a reducer](https://dev-to-uploads.s3.amazonaws.com/i/5cwa4prgdjrhoyurg68l.png)

This also increases your knowledge of the effects that these reducer actions have. When you separate your logic in actions you are aware of what action affects certain fields of the state. This gives you more control of the state, and implementing a new feature is easier.

## Separate logic

In this form, I need to fetch some data from an API on graphql. I use apollo and `@apollo/react-hooks`. When I get the data I need to update some state. Instead of having the data fetching in the same component, I can create a custom hook that returns just the state I need.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/3du90da0kr8ykakhqk3u.png)

If I need to use a mutation or add an extra query, I could write that logic in this hook also.

I recommend you to follow the **separation of concerns** principle for data fetching, you can create a separate file for the logic related to the data and just return the state that will be rendered in your component. This could also apply for your UI, creating a presentational component when it's needed will let you understand better how your app works.

## Split it into smaller pieces
The UI of the monster component I wrote has more than 100 lines of code. There were `div` after `div` and it took me more than two minutes to know what exactly I was doing. In all this `div` universe there were conditional renders, and I literally have to scroll down for a while to know where this end.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/05rg9dl6mbax4pgat62z.png)

Look at the code above. That `currentForm` boolean it's wrapping a big piece of JSX markup. It could be more readable if we move this UI into another component.

![Alt Text](https://dev-to-uploads.s3.amazonaws.com/i/1bqrzmnv5csryyjhbamh.png)

So much better, I can split this big component into smaller ones, so the next person that comes, and sees this code would know exactly where is everything.

### Conclusion

There is no perfect way of writing code, different teams follow different patterns, but if you feel the way I feel when I saw that code, it probably needs a refactor too. Keep in mind:

- If you are using multiple `useState`, try to change it to `useReducer`. You'll have better control and a wide vision of what is happening to your state in every action.

- Separate logic that can be reused. You can create a custom hook for data fetching or create util functions that can be used on other parts of your app.

- Split your component into smaller pieces. Extract pieces of JSX markup into a different component to improve the readability of your code.