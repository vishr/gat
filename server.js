var http = require("http");
var url = require("url");
var _ = require("lodash");
var Gat = require("./gat").Gat;
var cfg = require("./gat").config;
var pkg = require("./package.json");

http.createServer(function(req, res) {
  var urlObj = url.parse(req.url, true);
  var query = urlObj.query;

  if (req.method === "GET" && urlObj.pathname === "/") {
    try {
      var gat = new Gat(query.protocol, query.hostname, query.port);
      gat.get(query.path, req.headers, function(err, stream) {
        if (err) {
          res.writeHead(500);
          res.end();
        }

        if (stream.headers) {
          // Served from remote host
          res.writeHead(200, _.assign(_.clone(stream.headers), {
            "server": "Gat/" + pkg.version
          }));
          stream.pipe(res);
        } else {
          // Served from local cache
          res.writeHead(200, _.assign(
          _.omit(stream.gat.headers, "last-modified", "etag"), {
            "server": "Gat/" + pkg.version
          }));
          stream.pipe(res);
        }
      });
    } catch (e) {
      res.writeHead(400);
      res.end();
    }
  }
}).listen(cfg.port, "0.0.0.0");