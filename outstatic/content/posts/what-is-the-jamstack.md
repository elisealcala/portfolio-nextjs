---
title: What is the JAMstack?
description: And why you may want to use it?
publishedAt: 2020-05-08T13:14:22.699Z
status: published
slug: what-is-the-jamstack
---
If you are like me, maybe you have heard the term, or maybe you are overwhelmed by the many static site generators and don't know what exactly they are and what problems they solve.

In this article I want to learn like you, what is the JAMstack, why it's so popular nowadays and what are its benefits.

## The JAM

JAMstack stands for Javascript, APIs, and Markup.

**Javascript** handles the dynamic functionalities. You can use plain javascript or any framework you want.

**APIs**, the actions that you typically handle on a backend server are now abstracted into reusable APIs, accessed over HTTPS with Javascript.

**Markup**, static HTML files. This is prebuilt at build time, usually using a Static Site Generator.

These concepts seem very generic because they aren't applied to specific technologies like MERN *(Mongo, Express, React, Node)*, for example.

## What is not considered a JAMstack app?

Applications build on top of technologies like MERN are not considered JAMstack, that's because those apps use a web server to generate more of the HTML at runtime.

According to jamstack.org, apps built with a server-side CMS like WordPress or Drupal are not built with the JAMstack either.

In general any app that needs a server to run or it relies on a backend language it's not considered as a JAMstack app.

## Content Delivery Network (CDN)

JAMstack apps don't depend on web servers, they extract markup and assets into static files that you can serve from a CDN. This provides better performance and a faster application. Now you may be asking how I can generate those static files for my app?

Static Site Generators (SSG), are exactly for that, **Gatsby**, **Next.js**, **Nuxt**, and many other options around, help to develop an app with your favorite Javascript framework and then generate at build time a complete structure of static files that you can serve from a CDN.

There are many options also for you to deploy those static applications, the most common ones are **Netlify**, **AWS S3**, **Vercel**, **Firebase**.

If you want to dive into static generators, and how to choose the right one for your needs, check this [post](https://snipcart.com/blog/choose-best-static-site-generator).

## But since all the content is static, how can we get dynamic data?

That's when the APIs part comes into play, we can make a request or handle authorization with APIs. Let's take as an example an e-commerce app, you are using a static site generator to develop the markup, but how we can get the products data?

There's an interesting concept known as **headless CMS** where we can store and update the products so that later we can access them into our JAMstack app. Now you may be asking how is this different from a traditional CMS like WordPress, let's explain that.

A headless CMS makes your content accessible via Graphql or Rest APIs, it doesn't matter where your data get displayed, this headless CMS just store and then deliver that data. On the other hand a traditional CMS like WordPress stores not only the content but the frontend part of the app to render that particular content.

Like SSG there are plenty of headless CMS [options](https://headlesscms.org/), according to your needs, choose the right one for your app.

A headless CMS is not the only way to handle dynamic data in your app, you may need custom work for your app, even if you want to store some input from the user. You may be thinking that you need a server and a database, but not exactly. We can manage those features with serverless functions and DBaaS *(Database as a Service)*.

## Advantages

Since we talked about how the JAMstack works, and what are the tools you can use, let's get right into the advantages of this way of building websites.

- **Performance:** Since we served static files, these are incredibly fast.

- **Cheaper:** Hosting those files is cheaper.

- **Security:** With the processes abstracted into APIs, areas for attacks are reduced.

- **Developer Experience:** More focused development for frontends because we remove the need to maintain a separate stack.

  

I hope you find this article useful, personally I'm trying Gatsby and it has been great. If you are looking for a new way to build your next app, try the JAMstack.