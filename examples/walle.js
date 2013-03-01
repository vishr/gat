var os = require("os");
var fs = require("fs");
var path = require("path");
var Gat = require("../gat").Gat;

var TMP_DIR = os.tmpDir();
var FILE = "walle.png";

var gat = new Gat("https", "dl.dropbox.com");
gat.get("/u/11522638/" + FILE, null, function(err, stream) {
  if (err) {
    return console.error(err);
  }
  stream.pipe(fs.createWriteStream(path.join(TMP_DIR, FILE)));
  stream.on("close", function() {
    console.info("File %s saved in %s", FILE, TMP_DIR);
  });
});