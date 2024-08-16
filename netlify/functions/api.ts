import express, { Router, Request, Response, NextFunction } from 'express';
import serverless from "serverless-http";
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from "swagger-ui-express";
import cors, { CorsOptions } from 'cors';
import authRoutes from '../../src/modules/auth/routes';
import TransactionRoutes from '../../src/modules/transaction/routes';
import customerRoutes from '../../src/modules/customer/routes';
import serviceRoutes from '../../src/modules/services/routes';
import durationRoutes from '../../src/modules/duration/routes';
import emailSupport from "../../src/modules/email-support/routes";
import notesRoutes from '../../src/modules/notes/routes';
import cookieParser from 'cookie-parser';
// import authMiddleware from "../../src/middlewares";
const app = express();
app.use(express.json());

// CORS configuration
const allowedOrigins = [
  'https://merchant-app-fe.vercel.app',
  'https://cors.redoc.ly'
];
const localhostRegex = /^http:\/\/localhost(:\d+)?$/;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
      callback(null, true);
    } else {
      console.log(origin);
      callback(null, true);
      // callback(new Error('Not allowed by CORS'));
    }
  }
};

app.use(cors(corsOptions));
app.use(cookieParser());

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
        url: 'https://kasirlaundrypro.netlify.app/api', // Replace with your server URL
      },
    ]
  },
  apis: ["./src/modules/**/*.ts"], // Path to the API routes or files to be documented
};

const swaggerSpec = swaggerJsdoc(options);

// Serve Swagger UI
routerV1.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
routerV1.use("/docs-json", (req: Request, res: Response) => {
    res.json(swaggerSpec)
});

// Routes
routerV1.use("/auth", authRoutes);

// app.use(authMiddleware);
routerV1.use("/transaction", TransactionRoutes);
routerV1.use("/customer", customerRoutes);
routerV1.use("/note", notesRoutes);
routerV1.use("/service", serviceRoutes);
routerV1.use("/duration", durationRoutes);
routerV1.use("/email-support", emailSupport);
app.use("/api/", routerV1);

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const handler = serverless(app);
