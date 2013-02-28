var fs = require("fs");
var path = require("path");
var Gat = require("../gat").Gat;

var FILE = "node.png";

var gat = new Gat("https", "dl.dropbox.com");
gat.get("/u/11522638/" + FILE, null, function(err, stream) {
  if (err) {
    return console.error(err);
  }
  stream.pipe(fs.createWriteStream(path.join(__dirname, FILE)));
  stream.on("close", function() {
    console.info("done!");
  });
});