import { Router } from 'express';

export default (router: Router) => {
  router.use('/status', router);

  router.head('/', (_, res) => {
    res.status(200).end();
  });

  router.options('/', (_, res) => {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    };

    res.writeHead(200, headers);
  });

  router.get('/', (_, res) => {
    res.status(200).send('GET received');
  });

  router.post('/', (_, res) => {
    res.status(200).send('POST received');
  });

  router.put('/', (_, res) => {
    res.status(200).send('PUT received');
  });

  router.delete('/', (_, res) => {
    res.status(200).send('DELETE received');
  });

  router.patch('/', (_, res) => {
    res.status(200).send('PATCH received');
  });

  router.trace('/', (_, res) => {
    res.status(200).send('TRACE received');
  });
};
