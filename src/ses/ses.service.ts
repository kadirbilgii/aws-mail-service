import { Injectable } from '@nestjs/common';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class SesService {
  private sesClient: SESClient;

  constructor() {
    this.sesClient = new SESClient({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
  }

  async sendVerificationEmail(toEmail: string, token: string): Promise<void> {
    const verificationLink = `http://localhost:3000/user/verify-email?token=${token}`;

    const params = {
      Destination: {
        ToAddresses: [toEmail],
      },
      Message: {
        Body: {
          Html: {
            Charset: 'UTF-8',
            Data: `<p>Lütfen e-posta adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:</p>
                   <p><a href="${verificationLink}">E-posta Doğrulama</a></p>`,
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'E-posta Doğrulama',
        },
      },
      Source: process.env.SES_EMAIL_SOURCE,
    };

    const command = new SendEmailCommand(params);
    await this.sesClient.send(command);
  }
}
