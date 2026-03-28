import express from 'express';
import { auth } from './lib/auth.js';
import { toNodeHandler } from 'better-auth/node';
import { MediaRoutes } from './app/routes/index.js';
const app = express();
app.all('/api/auth/*', toNodeHandler(auth));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello');
});
app.use('/api', MediaRoutes);
export default app;
//# sourceMappingURL=app.js.map