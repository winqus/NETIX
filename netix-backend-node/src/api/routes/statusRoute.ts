import { Router } from 'express';

export default (router: Router) => {
  router.head('/status', (_, res) => {
    res.status(200).end();
  });

  router.options('/status', (_, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    res.writeHead(200, headers);
  });

  router.get('/status', (_, res) => {
    res.status(200).send('GET received');
  });

  router.post('/status', (_, res) => {
    res.status(200).send('POST received');
  });

  router.put('/status', (_, res) => {
    res.status(200).send('PUT received');
  });

  router.delete('/status', (_, res) => {
    res.status(200).send('DELETE received');
  });

  router.patch('/status', (_, res) => {
    res.status(200).send('PATCH received');
  });

  router.trace('/status', (_, res) => {
    res.status(200).send('TRACE received');
  });
};
