import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORS configuration
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });

  // Global API prefix (excludes health check routes)
  app.setGlobalPrefix('api', {
    exclude: ['/', 'api'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Start server
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🏎️  Sportdle API is running on port ${port}`);
  console.log(`📚 Documentation: https://documenter.getpostman.com/view/10146128/2sB3dK1Csq`);
}

bootstrap();
