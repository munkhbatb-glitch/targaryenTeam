import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WsAdapter } from '@nestjs/platform-ws';
import * as http from 'http';
import { AppModule } from './app.module';
import { CertService } from './cert/cert.service';

function isCloudDeploy() {
  return Boolean(process.env.PORT || process.env.NODE_ENV === 'production');
}

async function bootstrap() {
  const cloud = isCloudDeploy();
  const certService = new CertService();
  const httpsPort = Number(process.env.HTTPS_PORT || 3443);
  const httpPort = Number(process.env.HTTP_PORT || 3000);
  const listenPort = Number(process.env.PORT || httpsPort);

  const app = cloud
    ? await NestFactory.create<NestExpressApplication>(AppModule)
    : await NestFactory.create<NestExpressApplication>(AppModule, {
        httpsOptions: certService.getOrCreateCerts(),
      });

  const config = app.get(ConfigService);

  if (cloud) {
    app.set('trust proxy', 1);
  }

  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGIN', 'http://localhost:3000')
      .split(',')
      .map((o) => o.trim()),
    credentials: true,
  });

  app.useWebSocketAdapter(new WsAdapter(app));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  if (cloud) {
    await app.listen(listenPort, '0.0.0.0');

    const appUrl =
      config.get<string>('APP_URL') || `http://0.0.0.0:${listenPort}`;

    console.log('');
    console.log('Video call demo (production):');
    console.log(`  ${appUrl}`);
    console.log('');
    console.log('Render/Railway дээр HTTPS platform-оос ирнэ.');
    console.log('');
    return;
  }

  await app.listen(httpsPort);

  http
    .createServer((req, res) => {
      const host = req.headers.host?.split(':')[0] || 'localhost';
      res.writeHead(301, {
        Location: `https://${host}:${httpsPort}${req.url}`,
      });
      res.end();
    })
    .listen(httpPort);

  const ips = certService.getLocalIps();

  console.log('');
  console.log('Video call demo (NestJS + HTTPS):');
  console.log(`  https://localhost:${httpsPort}`);
  for (const ip of ips) {
    console.log(`  https://${ip}:${httpsPort}`);
  }
  console.log('');
  console.log('Анхаар: self-signed cert тул browser дээр "Advanced" → "Proceed" дар.');
  console.log(`HTTP (${httpPort}) → HTTPS (${httpsPort}) redirect хийнэ.`);
  console.log('');
}

bootstrap();
