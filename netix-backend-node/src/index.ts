import dotenv from 'dotenv';
import express, { Request, Response } from 'express';

dotenv.config();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 3055;

app.get('/', (_req: Request, res: Response) => {
  res.send('Express + TypeScript Server');
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
