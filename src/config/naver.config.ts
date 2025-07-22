import { registerAs } from '@nestjs/config';

export default registerAs('naver', () => ({
  oauth: {
    clientId: process.env.NAVER_CLIENT_ID,
    clientSecret: process.env.NAVER_CLIENT_SECRET,
    callbackUrl: process.env.NAVER_CALLBACK_URL || 'http://localhost:3000/api/auth/callback/naver',
  },
  cloud: {
    sms: {
      accessKey: process.env.NCP_ACCESS_KEY,
      secretKey: process.env.NCP_SECRET_KEY,
      serviceId: process.env.NCP_SERVICE_ID,
      callingNumber: process.env.NCP_CALLING_NUMBER,
    },
    email: {
      accessKey: process.env.NCP_EMAIL_ACCESS_KEY,
      secretKey: process.env.NCP_EMAIL_SECRET_KEY,
    },
  },
}));
