var http = require("http");
var url = require("url");
var _ = require("lodash");
var Gat = require("./gat").Gat;
var logger = require("./gat").logger;
var cfg = require("./gat").config;
var pkg = require("./package.json");

var server = http.createServer(function(req, res) {
  var urlObj = url.parse(req.url, true);
  var query = urlObj.query;

  if (req.method === "GET" && urlObj.pathname === "/") {
    var gat;
    try {
      gat = new Gat(query.protocol, query.hostname, query.port);
    } catch (e) {
      res.writeHead(400);
      return res.end();
    }

    gat.get(query.resource, req.headers, function(err, stream) {
      if (err) {
        res.writeHead(500);
        return res.end();
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
  }
}).listen(cfg.port, "0.0.0.0");

server.on("listening", function() {
  logger.info("gat started on port " + cfg.port);
});

server.on("error", function(err) {
  logger.error(err);
});