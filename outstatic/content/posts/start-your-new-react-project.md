---
title: A new React project with Typescript, Eslint, and Prettier.
publishedAt: 2020-03-13
status: published
description: Start your project from scratch.
slug: start-your-new-react-project
---

In almost every new project I start with React I always ask myself if I should use `create-react-app`. To small apps, this is a pretty good option but if you want to configure your app a little more and maybe change the babel and webpack configuration, you should start a project from scratch.

Let's create a new directory and initialize a default npm app.

```bash
# Make a new directory and move into it 
mkdir new-react-app && cd new-react-app

# Initialise a new npm project with defaults
npm init -y
```

Now our application has a  `package.json`  file. 

## Let's start with webpack and babel setup.

   ```bash
   # Install webpack 
   npm install --save-dev webpack webpack-cli webpack-dev-server
   
   # Install the html webpack plugin
   npm install --save-dev html-webpack-plugin
   ```

   ```bash
   # Install babel
   npm i --save-dev @babel/core babel-loader @babel/preset-env @babel/preset-react @babel/preset-typescript
   ```

    A babel preset it's a tool to add support for a certain language.

   **@babel/preset-env, @babel/preset-react and @babel/preset-typescript :** Allow us to add support for the latest features of javascript, react and typescript.

   Let's create a `webpack.config.js` file on the root of our app.

   ```javascript
   const path = require('path');
   const HtmlWebpackPlugin = require('html-webpack-plugin');
   
   module.exports = {
     entry: './src/app.tsx',
     resolve: {
       extensions: ['.ts', '.tsx', '.js'],
     },
     module: {
       rules: [
         {
           test: /\.(ts|tsx)$/,
           exclude: /node_modules/,
           use: {
             loader: 'babel-loader',
           },
         },
       ],
     },
     devServer: {
       contentBase: path.join(__dirname, 'build'),
       historyApiFallback: true,
       host: '0.0.0.0',
       compress: true,
       hot: true,
       port: 3000,
       publicPath: '/',
     },
     devtool: 'source-map',
     output: {
       filename: '[name].bundle.js',
       publicPath: '/',
       path: path.resolve(__dirname, 'build'),
     },
     plugins: [
       new HtmlWebpackPlugin({
         template: path.join(__dirname, 'index.html'),
       }),
     ],
   };
   
   ```

   This webpack configuration it's basic but it does the work.

   Let's create an `index.html` file on the root.

   ```html
   <!DOCTYPE html>
   <html>
     <head>
       <meta charset="utf-8" />
       <meta http-equiv="X-UA-Compatible" content="IE=edge">
       <title>My app with Typescript and React</title>
       <meta name="viewport" content="width=device-width, initial-scale=1">
     </head>
     <body>
       <div id="root"></div>
     </body>
   </html>
   ```

   Now let's create a `babel.config.js` file.

   ```javascript
   module.exports = {
     presets: [
       '@babel/preset-env',
       '@babel/preset-react',
       '@babel/preset-typescript',
     ],
   };
   ```

   In our `package.json` file, we have to add some script to run our app, and to compile it in a build folder.

   ```javascript
   // package.json
   
   {
     "scripts": {
       "start": "webpack-dev-server --mode development",
       "build": "webpack --mode production",
     },
   }
   
   ```

## Typescript and react.

   Typescript is a programming language developed by Microsoft. It's a superset of javascript, which means it has some additional features, like static typing  and support for object oriented programming options. Today is one of the most popular languages.

   ```bash
   # Install typescript
   npm install typescript
   
   #Install the react dependencies
   npm install react react-dom @types/react @types/react-dom
   ```

   **@types/react y @types/react-dom:** These packages add the types for react and react-dom.

   Let's create a `src` folder on the root, and inside an `app.tsx` file.

   ```bash
   mkdir src
   cd src
   touch app.tsx
   ```

   Our `app.tsx` can be like this for now.

   ```jsx
   import React from 'react';
   import ReactDom from 'react-dom';
   
   const App = () => <p>hello world</p>;
   
   ReactDom.render(<App />, document.getElementById('root') as HTMLElement);
   
   ```

   Now let's create a `tsconfig.json` file. This file has all the rules for typescript to work on our app. You can change it according to what you need. See the full list of options here, https://www.typescriptlang.org/docs/handbook/tsconfig-json.html.

   ```json
   {
     "compilerOptions": {
       "allowSyntheticDefaultImports": true,
       "noImplicitAny": true,
       "moduleResolution": "node",
       "baseUrl": "./",
       "sourceMap": true,
       "module": "esnext",
       "target": "esnext",
       "jsx": "react",
       "allowJs": true,
       "noEmit": true,
       "noImplicitThis": true,
       "strictNullChecks": true,
       "lib": ["es6", "dom"],
     },
   }
   ```

## Better development experience with Eslint and Prettier.

   Eslint is a linting tool for javascript. It analyzes our code, looking for syntax errors, saving us a lot of development time.

   Prettier is a code formatter. It enforces a consistent style across our app.

   ```bash
   # Install eslint and prettier
   npm install --save-dev eslint prettier
   
   # Install plugin and presets needed for our app
   npm install --save-dev eslint-config-prettier eslint-plugin-prettier eslint-plugin-react @typescript-eslint/eslint-plugin @typescript-eslint/parser
   ```

   **eslint-config-prettier:** It's important to use this package to avoid conflicts between eslint and prettier rules.

   **@typescript-eslint/eslint-plugin y @typescript-eslint/parser:** These plugins add support for typescript.

   Let's create a configuration file for Eslint called `.eslintrc.js` on the root of our project. You can change these rules according to your needs. 

   Here is the list of supported rules for `eslint-plugin-react`: https://github.com/yannickcr/eslint-plugin-react 

   ```javascript
   module.exports =  {
     parser:  '@typescript-eslint/parser',
     extends:  [
       'plugin:react/recommended',
       'plugin:@typescript-eslint/recommended',
       'plugin:prettier/recommended',
     ],
     parserOptions:  {
       ecmaVersion:  2018,
       sourceType:  'module',
     },
     plugins: ["prettier"],
     rules: {
       "prettier/prettier": [
         "error",
         {
           singleQuote: true,
           trailingComma: 'all',
         }
       ],
       'react/prop-types': [
         1,
         {
           ignore: ['context', 'tracking'],
         },
       ],
     },
     settings: {
       "react": {
         "version": "detect",
       },
     },
     overrides: [
       {
         files: ['*.ts', '*.tsx'],
         rules: {
           'react/prop-types': 'off',
         },
       },
     ],
   };
   ```

   Now if we are using VS Code, we can enable the option to format our code on save.

   Let's create a `.vscode` folder on the root, and create inside a `settings.json` file with this content.

   ```json
   {
     "eslint.validate": [
       "javascript",
       "javascriptreact",
       "Babel Javascript",
       "typescript",
       "typescriptreact",
     ],
     "eslint.alwaysShowStatus": true,
     "editor.codeActionsOnSave": {
       "source.fixAll.eslint": true
     },
   }
   ```


Now when we run `npm start` we should see our application run on `localhost:3000`.