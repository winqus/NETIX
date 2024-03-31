import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const envFound = dotenv.config();
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const app = express();
const port = process.env.PORT || 3055;

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});