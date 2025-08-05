import { setSeederFactory } from 'typeorm-extension';
import { Faker, ko } from '@faker-js/faker';
import { ObjectType, EntitySchema } from 'typeorm';

export const localeKoSetSeederFactory = <T>(
  entity: ObjectType<T> | EntitySchema<T>,
  factoryFunction: (faker: Faker) => T,
) => {
  return setSeederFactory(entity, () => {
    const faker = new Faker({ locale: [ko] });
    return factoryFunction(faker);
  });
};
