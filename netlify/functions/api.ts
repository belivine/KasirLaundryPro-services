import express, { Router } from 'express';
import serverless from "serverless-http";
import swaggerJsdoc from 'swagger-jsdoc';
import authRoutes from '../../src/modules/auth/routes';
import laundryRoutes from '../../src/modules/laundry/routes';
import customerRoutes from '../../src/modules/customer/routes';
import serviceRoutes from '../../src/modules/services/routes';
import durationRoutes from '../../src/modules/duration/routes';
import notesRoutes from '../../src/modules/notes/routes';
import { getAbsoluteFSPath } from 'swagger-ui-dist';

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

const swaggerSpec = swaggerJsdoc(options);
// Serve Swagger UI static assets
const swaggerUiPath = getAbsoluteFSPath();
routerV1.use('/docs', express.static(swaggerUiPath));

// Serve Swagger JSON
routerV1.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// Serve Swagger UI HTML
routerV1.get('/docs', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Swagger UI</title>
        <link rel="stylesheet" href="/api-docs/swagger-ui.css">
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="/api-docs/swagger-ui-bundle.js"></script>
        <script src="/api-docs/swagger-ui-standalone-preset.js"></script>
        <script>
          SwaggerUIBundle({
            url: '/swagger.json',
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIStandalonePreset
            ],
            layout: "StandaloneLayout"
          });
        </script>
      </body>
    </html>
  `);
});
  
// Routes
routerV1.use('/auth', authRoutes);
routerV1.use('/laundry', laundryRoutes);
routerV1.use('/customer', customerRoutes);
routerV1.use('/notes', notesRoutes);
routerV1.use('/service', serviceRoutes);
routerV1.use('/duration', durationRoutes); 
app.use("/api/", routerV1);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const handler = serverless(app);