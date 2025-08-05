import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { DataSourceOptions } from 'typeorm/data-source';
import { SeederOptions } from 'typeorm-extension';
import InitSeeder from '../init.seeder';

ConfigModule.forRoot({
  envFilePath: ['.env.local', '.env'],
});

const options: DataSourceOptions & SeederOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(String(process.env.DB_PORT), 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password123',
  database: process.env.DB_DATABASE || 'reservation_dev',
  entities: [__dirname + '/../../modules/**/*.entity.{js,ts}'],
  seeds: [InitSeeder],
  synchronize: false,
  logging: false,
};

export const source = new DataSource(options);
