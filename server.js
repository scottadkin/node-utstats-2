//const { createServer } = require("https");
const http = require("http");
const https = require("https");
const { parse } = require("url");
const next = require("next");
const {websitePort, imageServerPort, bUseSeperateImageServer, bUseHTTPS, ssl} = require("./config.json");
const fs = require("fs");


let options = {};

if(bUseHTTPS){
  options = {
      cert: fs.readFileSync(ssl.cert),
      key: fs.readFileSync(ssl.key),
  };
}


if(bUseSeperateImageServer){
    const express = require("express");

    const eApp = express();
    eApp.use(express.static("./public/"));
    eApp.listen(imageServerPort);
}

const dev = process.argv.indexOf("production") === -1;



//const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = process.env.PORT ?? websitePort;


// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();


app.prepare().then(() => {

  const server = (bUseHTTPS) ? https : http;

  server.createServer(options, async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true)
        await handle(req, res, parsedUrl)
      
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("internal server error")
    }
  }).listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://${hostname}:${port}`)
  })
})