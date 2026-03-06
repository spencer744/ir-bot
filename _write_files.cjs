// File writer script
const fs = require("fs");
const path = require("path");

const BASE = "C:/Users/Admin/Documents/Dev/IR Bot/client/src";

function w(relPath, content) {
  const full = path.join(BASE, relPath);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, content, "utf8");
  console.log("Created: " + relPath + " (" + content.length + " bytes)");
}

// Files will be appended below
const files = {};
