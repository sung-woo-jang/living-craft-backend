import { SeederConstructor } from 'typeorm-extension/dist/seeder/type';
import type { SeederFactoryItem } from 'typeorm-extension/dist/seeder/factory';

// Seeders
import UserSeeder from './user/user.seeder';

// Factories
import UserFactory from './user/user.factory';

export const seeds: SeederConstructor[] | string[] = [
  UserSeeder,
];

export const factories: SeederFactoryItem[] | string[] = [
  UserFactory,
];
