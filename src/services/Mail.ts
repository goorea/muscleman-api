import nodemailer, { Transporter } from 'nodemailer';
import Mailgen, { Content } from 'mailgen';
import { User } from '@src/models/User';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import { Address } from 'nodemailer/lib/mailer';

export class Mail {
  private static get transporter(): Transporter<SMTPTransport.SentMessageInfo> {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST || '',
      port: Number(process.env.MAIL_PORT),
      secure: Number(process.env.MAIL_PORT) === 465,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
    });
  }

  private static get mailgen(): Mailgen {
    return new Mailgen({
      theme: 'default',
      product: {
        name: process.env.APP_NAME || '',
        link: process.env.APP_CLIENT_URI || '',
      },
    });
  }

  private static send(
    to: string | Address | Array<string | Address>,
    subject: string,
    email: Content,
  ): Promise<SMTPTransport.SentMessageInfo> {
    return Mail.transporter.sendMail({
      from: `"근육맨 💪" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text: Mail.mailgen.generatePlaintext(email),
      html: Mail.mailgen.generate(email),
    });
  }

  static verify(
    user: User,
    token: string,
  ): Promise<SMTPTransport.SentMessageInfo> {
    return Mail.send(
      { name: user.name, address: user.email },
      `이메일을 인증해주세요 📨`,
      {
        body: {
          name: `${user.name}님`,
          greeting: '반갑습니다 ✋',
          signature: '당신의 근육을 위한',
          intro: `${
            process.env.APP_NAME || ''
          }에 오신 것을 환영합니다! 당신을 모시게 되어 매우 기쁩니다 🎉`,
          action: {
            instructions: '근육맨을 시작하려면, 여기를 클릭하세요:',
            button: {
              color: '#3c95d0',
              text: '이메일 인증하기',
              link: `${process.env.APP_CLIENT_URI}/email/verify?token=${token}`,
            },
          },
          outro: '도움이 필요하거나 질문이 있으시면 이 이메일로 회신해주세요',
        },
      },
    );
  }
}
