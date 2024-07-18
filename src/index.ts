import express from 'express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import authRoutes from './modules/auth/routes';
import laundryRoutes from './modules/laundry/routes';
import customerRoutes from './modules/customer/routes';
import serviceRoutes from './modules/services/routes';
import durationRoutes from './modules/duration/routes';


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
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/v1/auth', authRoutes);
app.use('/v1/laundry', laundryRoutes);
app.use('/v1/customer', customerRoutes);
app.use('/v1/service', serviceRoutes);
app.use('/v1/duration', durationRoutes); 

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
