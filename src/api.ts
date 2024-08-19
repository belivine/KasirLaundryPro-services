import express, { Request, Response, NextFunction, Router } from "express";
import serverless from "serverless-http";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import cors, { CorsOptions } from 'cors';
import fs from "fs";
import authRoutes from "./modules/auth/routes";
import TransactionRoutes from "./modules/transaction/routes";
import customerRoutes from "./modules/customer/routes";
import serviceRoutes from "./modules/services/routes";
import durationRoutes from "./modules/duration/routes";
import emailSupport from "./modules/email-support/routes";
import notesRoutes from "./modules/notes/routes";
import users from "./modules/user/routes";
import cookieParser from 'cookie-parser';
import authMiddleware from "./middlewares";
import session from "express-session";
import passport from "./modules/auth/passportConfig";

const app = express();

// CORS configuration
const allowedOrigins = ['https://merchant-app-fe.vercel.app'];
const localhostRegex = /^http:\/\/localhost(:\d+)?$/;

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || localhostRegex.test(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
      // callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json());
// Session configuration (necessary for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log('Middleware Check:', req.body);
  next();
});

const port = 3000;
const routerV1 = Router();

// Swagger configuration and setup
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Kasir Laundry Pro",
      version: "1.0.0",
      description: "API Routes and schema details of Kasir Laundry Pro Services",
    },
    servers: [
      {
        url: 'http://localhost:3000/api',
      },
    ]
  },
  apis: ["./src/modules/**/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);
fs.writeFileSync('swagger.yaml', JSON.stringify(swaggerSpec, null, 2));

routerV1.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
routerV1.use("/docs-json", (req: Request, res: Response) => {
  res.json(swaggerSpec)
});

// Routes setup
routerV1.use("/auth", authRoutes);

routerV1.use(authMiddleware);
routerV1.use("/transaction", TransactionRoutes);
routerV1.use("/user", users);
routerV1.use("/customer", customerRoutes);
routerV1.use("/note", notesRoutes);
routerV1.use("/service", serviceRoutes);
routerV1.use("/duration", durationRoutes);
routerV1.use("/email-support", emailSupport);
app.use("/api/", routerV1);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

export const handler = serverless(app);
