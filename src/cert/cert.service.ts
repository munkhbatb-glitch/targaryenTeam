import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import selfsigned from 'selfsigned';

@Injectable()
export class CertService {
  getLocalIps(): string[] {
    const ips: string[] = [];

    for (const interfaces of Object.values(os.networkInterfaces())) {
      if (!interfaces) continue;
      for (const iface of interfaces) {
        if (iface.family === 'IPv4' && !iface.internal) {
          ips.push(iface.address);
        }
      }
    }

    return ips;
  }

  getOrCreateCerts(): { key: Buffer | string; cert: Buffer | string } {
    const certDir = path.join(process.cwd(), '.certs');
    const keyPath = path.join(certDir, 'key.pem');
    const certPath = path.join(certDir, 'cert.pem');

    if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
      return {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      };
    }

    const altNames = [
      { type: 2, value: 'localhost' },
      { type: 7, ip: '127.0.0.1' },
      ...this.getLocalIps().map((ip) => ({ type: 7, ip })),
    ];

    const pems = selfsigned.generate(undefined, {
      keySize: 2048,
      days: 365,
      algorithm: 'sha256',
      extensions: [
        { name: 'basicConstraints', cA: true },
        {
          name: 'keyUsage',
          keyCertSign: true,
          digitalSignature: true,
          nonRepudiation: true,
          keyEncipherment: true,
          dataEncipherment: true,
        },
        {
          name: 'subjectAltName',
          altNames,
        },
      ],
    });

    fs.mkdirSync(certDir, { recursive: true });
    fs.writeFileSync(keyPath, pems.private);
    fs.writeFileSync(certPath, pems.cert);

    return { key: pems.private, cert: pems.cert };
  }
}
