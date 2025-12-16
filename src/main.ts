import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Serve static files from public directory
  app.useStaticAssets(join(__dirname, '..', 'public'));
  
  // Enable CORS for frontend applications
  app.enableCors({
    origin: '*', // Configure this for production
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  // Enable validation pipes globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  
  // Setup Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('LiveKit Server Controller API')
    .setDescription(
      'REST API for controlling and managing LiveKit server. ' +
      'Create rooms, manage participants, generate access tokens, and more.'
    )
    .setVersion('1.0')
    .addTag('livekit', 'LiveKit server control endpoints')
    .addTag('rooms', 'Room management operations')
    .addTag('participants', 'Participant management operations')
    .addTag('tokens', 'Access token generation')
    .addServer('http://localhost:3000', 'Local development server')
    .addServer('https://your-production-url.com', 'Production server')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    customSiteTitle: 'LiveKit Controller API',
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'none',
      filter: true,
      showRequestDuration: true,
    },
  });
  
  const port = process.env.PORT ?? 3000;
  // Listen on all interfaces (0.0.0.0) to allow network access
  await app.listen(port, '0.0.0.0');
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📡 LiveKit Server URL: ${process.env.LIVEKIT_URL}`);
  console.log(`📖 Swagger API Docs: http://localhost:${port}/api`);
  console.log(`🎥 Test Client: http://localhost:${port}/test-client.html`);
  console.log(`📚 API Endpoints: http://localhost:${port}/livekit/`);
  console.log(`${'='.repeat(60)}\n`);
}
bootstrap();
