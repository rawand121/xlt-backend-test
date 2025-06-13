import express from 'express';
import morganLogger from '../configs/morgan.logger';
import cors from 'cors';
import routes from '../routes/index';
import { errorHandler } from '../utils/errorHandler';
import { xss } from 'express-xss-sanitizer';
import helmet from 'helmet';
import 'dotenv/config';
import envVar from '../configs/envVars';
import cookieParser from 'cookie-parser';

const DOTENV = envVar.NODE_ENV;

const startServer = async (app: any) => {
  app.use(morganLogger);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(xss());
  app.use(helmet());
  app.use(cookieParser());

  if (DOTENV === 'development') {
    app.use(
      cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
      }),
    );
    app.options(
      '*',
      cors({
        origin: ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
      }),
    );
  } else {
    app.use(
      cors({
        origin: true, // Allow all origins temporarily for debugging
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Set-Cookie'],
      }),
    );
    // this options is for preflight only, just to make sure the server is ready and it has enought permission to ask the data.
    app.options(
      '*',
      cors({
        origin: true, // Allow all origins temporarily for debugging
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
        exposedHeaders: ['Set-Cookie'],
      }),
    );
  }

  app.use('/api', routes);
  app.use(errorHandler);

  return app;
};

export default startServer;
