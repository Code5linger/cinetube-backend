// import app from './app.js';
// import { config } from './config.js';

// app.listen(config.port, () => {
//   console.log(`API running on http://localhost:${config.port}`);
// });

import 'dotenv/config';
import app from './app.js'; // .js extension required for NodeNext ESM resolution

const bootstrap = () => {
  try {
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on http://localhost:${process.env.PORT}`);
    });
  } catch (error) {
    console.log(`Failed to start server! Cause of: ${error}`);
  }
};

bootstrap();
