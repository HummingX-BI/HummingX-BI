const http = require('http');

const server = http.createServer((req, res) => {
  const targetUrl = `http://localhost:5180${req.url}`;
  res.writeHead(302, { Location: targetUrl });
  res.end(`Redirecting to ${targetUrl}`);
});

server.listen(5177, '0.0.0.0', () => {
  console.log('Redirect service active on port 5177 -> forwarding to http://localhost:5180');
});
