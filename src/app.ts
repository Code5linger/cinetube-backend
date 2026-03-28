import express, { Application, Request, Response } from 'express';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import { rootRouter } from './app/routes/index.js';

const app: Application = express();

app.all('/api/auth/*splat', toNodeHandler(auth));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

app.use('/api', rootRouter);

export default app;
