import { registerAs } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default registerAs(
  'database',
  (): TypeOrmModuleOptions => ({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 5432,
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'password123',
    database: process.env.DB_DATABASE || 'reservation_dev',
    entities: [__dirname + '/../modules/**/*.entity.{js,ts}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging',
    logging: process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'staging',
    autoLoadEntities: true,
    retryAttempts: 10,
    retryDelay: 3000,
  }),
);
