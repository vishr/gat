# Gat [![Build Status](https://travis-ci.org/vishr/gat.png?branch=master)](https://travis-ci.org/vishr/gat)
An HTTP caching server

## Features
* Supports http and https protocols
* Configurable limit for the cache - coming soon!
* Automatically deletes the resouce not found on the remote host
* Automatically reclaims the disk space based on LRU - coming soon!
* Saves bandwidth and time

## Installation
```sh
  $ npm i gat -g
```

## Usage

### Standalone
```sh
  $ gat -h

    Usage: gat [options] [command]

    Commands:

      config                 show config
      start                  start gat
      stop                   stop gat
      restart                restart gat
      empty                  empty cache
      *                      unknown command

    Options:

      -h, --help     output usage information
      -V, --version  output the version number
      -e, --edit     edit config

  $ gat start
  info: starting gat on port 1947

  $ gat config      # show config

  $ gat -e config   # edit config

```
**Request**
```sh
  curl -O "http://localhost:1947/?protocol=https&hostname=dl.dropbox.com&resource=/u/11522638/node.png"
```
**Response**
```sh
  HTTP/1.1 200 OK
  server: Gat/0.0.9
  date: Sun, 10 Mar 2013 17:31:27 GMT
  content-type: image/png
  content-length: 817701
  connection: keep-alive
  x-robots-tag: noindex,nofollow
  accept-ranges: bytes
  x-server-response-time: 523
  x-dropbox-request-id: 7914ee643fdfb67b
  pragma: public
  cache-control: max-age=0
```

### As a node module
```js
  var os = require("os");
  var fs = require("fs");
  var path = require("path");
  var Gat = require("../gat").Gat;

  var FILE = "walle.png";
  var FILE_PATH = path.join(os.tmpDir(), FILE);

  Gat.setConfig({
    port: 3737
  });

  var gat = new Gat("https", "dl.dropbox.com");
  gat.get("/u/11522638/" + FILE, null, function(err, stream) {
    if (err) {
      return console.error(err);
    }
    stream.pipe(fs.createWriteStream(FILE_PATH));
    stream.on("close", function() {
      console.info("File saved: " + FILE_PATH);
    });
  });
```
