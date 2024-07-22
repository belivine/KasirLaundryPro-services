import express, { Router } from 'express';
import serverless from "serverless-http";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './modules/auth/routes';
import laundryRoutes from './modules/laundry/routes';
import customerRoutes from './modules/customer/routes';
import serviceRoutes from './modules/services/routes';
import durationRoutes from './modules/duration/routes';
import path from "path";

const app = express();
const port = 3000;

const routerV1 = Router();

// Swagger configuration
const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Kasir Laundry Pro',
      version: '1.0.0',
      description: 'API Routes and schema details of Kasir Laundry Pro Services',
    },
    servers: [
    {
      url: 'https://kasirlaundrypro.netlify.app/api/', // Replace with your server URL
    },
  ],
  },
  apis: ['./src/modules/**/*.ts'], // Path to the API routes or files to be documented
};

const specs = swaggerJsdoc(options);
const swaggerUIMiddleware = swaggerUi.setup(specs);
const req: any = {};
const res: any = { send: () => {} };

// Make a mock request to the swagger ui middleware to initialize it.
// Workaround issue: https://github.com/scottie1984/swagger-ui-express/issues/178
swaggerUIMiddleware(req, res, () => {});
routerV1.use('/docs', swaggerUi.serve, swaggerUIMiddleware);
  
// Routes
routerV1.use('/auth', authRoutes);
routerV1.use('/laundry', laundryRoutes);
routerV1.use('/customer', customerRoutes);
routerV1.use('/service', serviceRoutes);
routerV1.use('/duration', durationRoutes); 
app.use("/api/", routerV1);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const handler = serverless(app);