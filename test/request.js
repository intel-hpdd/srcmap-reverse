// @flow

import http from 'http';

const options = {
  headers: {
    Connection: 'close',
    Accept: 'application/json',
    'Content-Type': 'application/json; charset=UTF-8',
    'Transfer-Encoding': 'chunked'
  },
  method: 'POST',
  socketPath: '/var/run/iml-srcmap-reverse.sock'
};

export default (trace: string) => {
  return new Promise(resolve => {
    const req: http.ClientRequest = http.request(options, resp => {
      let data = '';
      resp.on('data', chunk => {
        data += chunk;
      });
      resp.on('end', () => {
        resolve(JSON.parse(data));
      });
    });

    const post = JSON.stringify({
      trace,
      srcmapFile: '/tmp/built-fd5ce21b.js.map.json'
    });

    req.write(post);
    req.end();
  });
};
