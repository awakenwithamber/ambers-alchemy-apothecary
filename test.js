const jsdom = require('jsdom');
const { JSDOM } = jsdom;
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf-8');

const dom = new JSDOM(html, { url: "file://" + __dirname + "/index.html", runScripts: "dangerously", resources: "usable" });

dom.window.onerror = function (message, source, lineno, colno, error) {
  console.log('Error:', message, source, lineno, colno);
};

setTimeout(() => {
  console.log("Products length:", dom.window.PRODUCTS ? dom.window.PRODUCTS.length : "undefined");
  console.log("Shop content length:", dom.window.document.getElementById('shopGrid').innerHTML.length);
  console.log("Music src:", dom.window.document.querySelector('audio source').src);
  process.exit(0);
}, 2000);
