import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './modules/auth/routes';
import laundryRoutes from './modules/laundry/routes';

const app = express();
const port = 3000;

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
app.use('/v1/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/laundry', laundryRoutes);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
