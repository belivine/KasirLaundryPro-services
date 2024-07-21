import express, { Router } from 'express';
import serverless from "serverless-http";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from '../../src/modules/auth/routes';
import laundryRoutes from '../../src/modules/laundry/routes';
import customerRoutes from '../../src/modules/customer/routes';
import serviceRoutes from '../../src/modules/services/routes';
import durationRoutes from '../../src/modules/duration/routes';


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
  },
  apis: ['./src/modules/**/*.ts'], // Path to the API routes or files to be documented
};

const specs = swaggerJsdoc(options);
routerV1.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/swagger-ui.css',
    customJs: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@latest/swagger-ui-bundle.js',
  }));
  
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