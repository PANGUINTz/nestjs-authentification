import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { useContainer } from 'class-validator';
import { urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  //CORS | MIDDLEWARE
  app.enableCors();
  app.use(cookieParser());
  app.use(urlencoded({ extended: true }));

  //SWAGGER
  const config = new DocumentBuilder()
    .setTitle('API Example')
    .setDescription('Nestjs Demo Documents')
    .setVersion('1.0')
    .addTag('api')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  //CUSTOM VALIDATION
  app.useGlobalPipes(new ValidationPipe());
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  //APP START
  await app.listen(3000);
}
bootstrap();
