# react-demo

A simple demo of ReactJS and the ability to render on the server *or* the client.

## Setup

```
git clone git@github.com:allenai/react-demo
cd react-demo
npm install
```

Edit `src/client/src/config.js` and add the appropriate Aristo controller url:

```
module.exports = {
  API_URL: 'INSERT_YOUR_URL_HERE';
}
```

Run the server script from the project root to start things up.

```
bin/server start
```

Navigate to [http://localhost:4000](http://localhost:4000) and start hacking away.

Client-side code is automatically rebuild using [Griddle](http://github.com/allenai/griddle), but you'll have to restart the server after JSX changes for server-side rendering to work correctly.

## Known Issues

`react-router-component` isn't great and promotes anti-patterns.  I plan on replacing it.
