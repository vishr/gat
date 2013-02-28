var path = require("path");
var fs = require("fs-extra");
var Gat = require("../gat").Gat;
var cfg = require("../gat").config;

var TMP = path.join(__dirname, "tmp");
var FILE1 = "node.png";
var FILE2 = "walle.png";

var gat = new Gat("https", "dl.dropbox.com");

describe("Gat", function() {
  before(function(done) {
    // Make temporary directory
    fs.mkdirs(TMP, function() {
      // Empty cache
      fs.remove(cfg.root, function() {
        // Cache FILE2
        gat.get("/u/11522638/" + FILE2, null, function(err, stream) {
          if (err) {
            return done(err);
          }
          stream.on("end", done);
        });
      });
    });
  });

  describe("#get()", function() {
    it("should get the resouce from remote host", function(done) {
      gat.get("/u/11522638/" + FILE1, null, function(err, stream) {
        if (err) {
          return done(err);
        }
        if (stream.headers) {
          stream.on("close", done);
          stream.pipe(fs.createWriteStream(path.join(TMP, FILE1)));
        } else {
          done(new Error("Failed getting the resource"));
        }
      });
    });

    it("should get the resouce from local cache", function(done) {
      gat.get("/u/11522638/" + FILE2, null, function(err, stream) {
        if (err) {
          return done(err);
        }
        if (!stream.headers) {
          stream.on("close", done);
          stream.pipe(fs.createWriteStream(path.join(TMP, FILE2)));
        } else {
          done(new Error("Failed getting the resource"));
        }
      });
    });
  });

  after(function(done) {
    // Remove temporary directory
    fs.remove(TMP, done);
  });
});