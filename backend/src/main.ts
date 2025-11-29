import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ws } from './ws';

export const HOST = '0.0.0.0';
export const PORT = 7015;
export let server: any;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  server = app.getHttpServer();
  await app.listen(PORT, HOST);
  console.log(`Listen HTTP: http://${HOST}:${PORT}`);
}

bootstrap();
