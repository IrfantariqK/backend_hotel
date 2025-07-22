import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config();
  const app = await NestFactory.create(AppModule);

  // Enable CORS for your frontend
  app.enableCors({
    origin: 'http://localhost:3001', // Frontend ka origin
    credentials: true, // Agar aap cookies ya authentication use karte hain
  });

  await app.listen(process.env.PORT || 3000);
}
bootstrap();