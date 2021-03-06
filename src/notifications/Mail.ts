import Mailgen, { Content } from 'mailgen';
import { Transporter, createTransport } from 'nodemailer';
import { Address } from 'nodemailer/lib/mailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import { User } from '@src/models/User';

export class Mail {
  private static get transporter(): Transporter<SMTPTransport.SentMessageInfo> {
    return createTransport({
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
  ): Promise<SMTPTransport.SentMessageInfo | true> {
    if (process.env.NODE_ENV === 'test') {
      return Mail.transporter.verify();
    }

    return Mail.transporter.sendMail({
      from: `"κ·Όμ‘λ§¨ πͺ" <${process.env.MAIL_FROM_ADDRESS}>`,
      to,
      subject,
      text: Mail.mailgen.generatePlaintext(email),
      html: Mail.mailgen.generate(email),
    });
  }

  static verify(
    user: User,
    token: string,
  ): Promise<SMTPTransport.SentMessageInfo | true> {
    return Mail.send(
      { name: user.name, address: user.email },
      `μ΄λ©μΌμ μΈμ¦ν΄μ£ΌμΈμ π¨`,
      {
        body: {
          name: `${user.name}λ`,
          greeting: 'λ°κ°μ΅λλ€ β',
          signature: 'λΉμ μ κ·Όμ‘μ μν',
          intro: `${
            process.env.APP_NAME || ''
          }μ μ€μ  κ²μ νμν©λλ€! λΉμ μ λͺ¨μκ² λμ΄ λ§€μ° κΈ°μ©λλ€ π`,
          action: {
            instructions: 'κ·Όμ‘λ§¨μ μμνλ €λ©΄, μ¬κΈ°λ₯Ό ν΄λ¦­νμΈμ:',
            button: {
              color: '#3c95d0',
              text: 'μ΄λ©μΌ μΈμ¦νκΈ°',
              link: `${process.env.APP_CLIENT_URI}/email/verify?token=${token}`,
            },
          },
          outro: 'λμμ΄ νμνκ±°λ μ§λ¬Έμ΄ μμΌμλ©΄ μ΄ μ΄λ©μΌλ‘ νμ ν΄μ£ΌμΈμ',
        },
      },
    );
  }
}
