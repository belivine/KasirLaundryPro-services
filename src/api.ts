import express, { Router } from "express";
import serverless from "serverless-http";
import swaggerJsdoc from "swagger-jsdoc";
import authRoutes from "./modules/auth/routes";
import laundryRoutes from "./modules/laundry/routes";
import customerRoutes from "./modules/customer/routes";
import serviceRoutes from "./modules/services/routes";
import durationRoutes from "./modules/duration/routes";
import notesRoutes from "./modules/notes/routes";
import swaggerUi from "swagger-ui-express";
import cors from 'cors';

const app = express();
app.use(express.json()); 
app.use(cors());
app.use((req, res, next) => {
  console.log('Middleware Check:', req.body); // Log to check if body is parsed
  next();
});

const port = 3000;

const routerV1 = Router();

// Swagger configuration
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kasir Laundry Pro",
      version: "1.0.0",
      description:
        "API Routes and schema details of Kasir Laundry Pro Services",
    },
    servers: [
      {
        url: 'http://localhost:3000/api/', // Replace with your server URL
      },
    ]
  },
  apis: ["./src/modules/**/*.ts"], // Path to the API routes or files to be documented
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
routerV1.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
routerV1.use("/docs-json", (req, res) => {
    res.json(swaggerSpec)
})

// Routes
routerV1.use("/auth", authRoutes);
routerV1.use("/laundry", laundryRoutes);
routerV1.use("/customer", customerRoutes);
routerV1.use("/note", notesRoutes);
routerV1.use("/service", serviceRoutes);
routerV1.use("/duration", durationRoutes);
app.use("/api/", routerV1);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const handler = serverless(app);
