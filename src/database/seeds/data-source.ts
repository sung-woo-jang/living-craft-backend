import { DataSource } from 'typeorm';
import { User } from '@modules/admin/users/entities/user.entity';
import * as dotenv from 'dotenv';

// 환경 변수 로드
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_DATABASE || 'living_craft',
  entities: [User],
  synchronize: false,
  logging: false,
});
