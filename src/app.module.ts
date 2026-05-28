import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { existsSync } from 'fs';
import { join } from 'path';
import { CertModule } from './cert/cert.module';
import { InviteModule } from './invite/invite.module';
import { SignalingModule } from './signaling/signaling.module';

const frontendOut = join(process.cwd(), 'frontend', 'out');

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...(existsSync(frontendOut)
      ? [
          ServeStaticModule.forRoot({
            rootPath: frontendOut,
            exclude: ['/api/(.*)'],
            serveStaticOptions: {
              index: ['index.html'],
            },
          }),
        ]
      : []),
    CertModule,
    SignalingModule,
    InviteModule,
  ],
})
export class AppModule {}
