import { registerAs } from '@nestjs/config';

export default registerAs('admin', () => ({
  email: process.env.ADMIN_EMAIL || 'admin@example.com',
  password: process.env.ADMIN_PASSWORD || 'admin123!',
}));
