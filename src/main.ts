import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import helmet from 'helmet';
import * as compression from 'compression';
import * as dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express';

async function bootstrap() {
  dotenv.config();
  
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log'],
  });

  // Security middlewares
  app.use(helmet({
    crossOriginEmbedderPolicy: false, // Needed for Stripe webhooks
  }));
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global exception filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001'];
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'stripe-signature'],
  });

  // Raw body for Stripe webhooks
  app.use('/payment/webhook', (req: Request, res: Response, next: NextFunction) => {
    req.setEncoding('utf8');
    let data = '';
    req.on('data', (chunk: string) => {
      data += chunk;
    });
    req.on('end', () => {
      // @ts-ignore: augment req with body property since it's raw data here
      req.body = data;
      next();
    });
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  logger.log(`🚀 Application is running on: http://localhost:${port}`);
}

bootstrap().catch((error) => {
  Logger.error('❌ Error starting server', error);
  process.exit(1);
});
