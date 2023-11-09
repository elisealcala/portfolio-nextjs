---
title: Start a new Electron app with React and Typescript.
description: Build your first desktop app today
publishedAt: 2020-04-17T02:19:45.947Z
status: published
slug: start-a-new-electron-app-with-react-and-typescript
---
### What is Electron?

Electron is a framework for creating native applications. It's open-source and cross-platform. If you already know Javascript, HTML, and CSS you can build an application with electron.

In this tutorial, I'll show you how to start an electron project from scratch using webpack, react, and Typescript.

## Start with Electron.

Let's start by creating a new folder and a new `npm` project.

```bash
mkdir electron-react-ts
cd electron-react-ts
npm init -y
```

Now install these dependencies.

```bash
npm install --save-dev electron \
webpack webpack-cli webpack-dev-server \
babel-loader @babel/core @babel/preset-env \
@babel/preset-react @babel/preset-typescript
```
Create a `tsconfig.json` file. This allows you to specify the configuration for the typescript compiler.

```json
{
  "compilerOptions": {
    "target": "es5",
    "module": "commonjs",
    "lib": [
      "dom",
      "es2015",
      "es2016",
      "es2017"
    ],
    "allowJs": true,
    "jsx": "react",
    "sourceMap": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
  }
}
```
Create a `babel.config.js` and an `index.html` file at the root of our app.

```javascript
module.exports = {
  presets: [
    '@babel/preset-env',
    '@babel/preset-react',
    '@babel/preset-typescript'
  ]
}
```

```html
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Electron App</title>
</head>
<body>
</body>
</html>
```
Let's create a new file called `webpack.electron.config.js` on the root of our app. This webpack file will compile our electron app into a `dist ` folder.

```js
const path = require('path');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devtool: 'source-map',
  entry: './electron/main.ts',
  target: 'electron-main',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].js',
  },
};
```
This looks like a normal webpack configuration for typescript, except for the target. The target is the specific environment that webpack will compile for. In this case it's `electron-main`. 

Create an `electron` folder, then inside a `main.ts` file with the following code.
This file should create windows and handle the systems events for your app.

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import * as url from 'url';

let mainWindow: Electron.BrowserWindow | null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL(`http://localhost:4000`);
  } else {
    mainWindow.loadURL(
      url.format({
          pathname: path.join(__dirname, '../index.html'),
          protocol: 'file:',
          slashes: true
      })
    );
  }
  
  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', createWindow);
app.allowRendererProcessReuse = true;
```

The `BrowserWindow` module will create a new window and render our react app.

Now let's add a script in the `package.json` file in order to run electron. Also, we have to change the `main` field for the path that has our electron app compiled.

```json
{
  "main": "./dist/main.js",
	"scripts": {
    "dev:electron": "NODE_ENV=development webpack --config webpack.electron.config.js --mode development && electron ."
  },
}
```

Now run `npm run dev:electron` in the console.

**Note:** If you are using Windows, chances are you'll face an error, this is because `NODE_ENV` is not recognized as a command. You have to install [crossenv](https://www.npmjs.com/package/cross-env) and place the command before `NODE_ENV`.

## Add a React app.

Now that we have our electron app running, let's set up a react app to run within this electron context.

We need to install a few dependencies.

```bash
npm install react react-dom @types/react @types/react-dom

npm install --save-dev html-webpack-plugin
```

Create a new `webpack.react.config.js` file.

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    mainFields: ['main', 'module', 'browser'],
  },
  entry: './src/app.tsx',
  target: 'electron-renderer',
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.(js|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
    ],
  },
  devServer: {
    contentBase: path.join(__dirname, '../dist/renderer'),
    historyApiFallback: true,
    compress: true,
    hot: true,
    port: 4000,
    publicPath: '/',
  },
  output: {
    path: path.resolve(__dirname, '../dist/renderer'),
    filename: 'js/[name].js',
    publicPath: './',
  },
  plugins: [
    new HtmlWebpackPlugin(),
  ],
};
```

Our `package.json` file now should look like this.

```json
{
  "main": "./dist/main.js",
    "scripts": {
      "dev:electron": "NODE_ENV=development webpack --config webpack.electron.config.js --mode development && electron .",
      "dev:react": "NODE_ENV=development webpack-dev-server --config webpack.react.config.js --mode development"
    },
 }
```

In order to try this app, let's create a new folder `src` with an`app.tsx` file inside.

```tsx
import React from 'react';
import ReactDom from 'react-dom';

const mainElement = document.createElement('div');
document.body.appendChild(mainElement);

const App = () => {
  return (
    <h1>
      Hi from a react app
    </h1>
  )
}

ReactDom.render(<App />, mainElement);
```
Now we are ready. 
Run `npm run dev:react` in one console, and `npm run dev: electron` on other one.

![Electron app](https://dev-to-uploads.s3.amazonaws.com/i/galshz0fv4ha0qbwhgak.png)

Check this [repo](https://github.com/elisealcala/electron-react-ts) for the code.