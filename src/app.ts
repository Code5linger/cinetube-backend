// import cors from 'cors';
// import { config } from './config.js';
// import { apiRouter } from './routes/index.js';
// import { AppError } from './utils/http.js';

// const app = express();

// app.use(
//   cors({
//     origin: config.frontendUrl,
//     credentials: true,
//   }),
// );
// app.use(express.json());

// app.get('/health', (_req, res) => {
//   res.json({ ok: true, service: 'movie-portal-api' });
// });

// app.use('/api', apiRouter);

// const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
//   const appError = err as AppError;
//   console.error(err);
//   res.status(appError.status || 500).json({
//     message: appError.message || 'Internal server error',
//   });
// };

// app.use(errorHandler);

// export default app;

import express, { Application, Request, Response } from 'express';

const app: Application = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello');
});

export default app;
