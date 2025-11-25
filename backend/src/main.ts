// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ws } from './ws';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const host = '0.0.0.0';
  const port = 7015;
  const server = app.getHttpServer();
  ws.init(server);

  await app.listen(port, host);
  console.log(`Listen HTTP: http://${host}:${port}`);
  console.log(`  Listen WS:   ws://${host}:${port}/ws`);
}

bootstrap();
