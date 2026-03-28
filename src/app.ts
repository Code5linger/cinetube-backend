import express, { Application, Request, Response } from 'express';
import { rootRouter } from './app/routes/index.js';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

app.use('/api', rootRouter);

export default app;
