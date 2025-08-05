import { runSeeders, Seeder, SeederFactoryManager } from 'typeorm-extension';
import { DataSource } from 'typeorm';
import { seeds, factories } from './seeds';

export default class InitSeeder implements Seeder {
  async run(dataSource: DataSource, _factoryManager: SeederFactoryManager): Promise<any> {
    await runSeeders(dataSource, {
      seeds,
      factories,
    });
  }
}
