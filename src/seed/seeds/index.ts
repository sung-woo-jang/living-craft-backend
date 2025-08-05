import { SeederConstructor } from 'typeorm-extension/dist/seeder/type';
import type { SeederFactoryItem } from 'typeorm-extension/dist/seeder/factory';

// Seeders
import UserSeeder from './user/user.seeder';
import ServiceSeeder from './service/service.seeder';
import CalendarSeeder from './calendar/calendar.seeder';
import FaqSeeder from './faq/faq.seeder';
import NotificationTemplateSeeder from './notification-template/notification-template.seeder';
import PortfolioSeeder from './portfolio/portfolio.seeder';
import ReservationSeeder from './reservation/reservation.seeder';
import ReviewSeeder from './review/review.seeder';

// Factories
import UserFactory from './user/user.factory';
import ServiceFactory from './service/service.factory';
import CalendarSettingFactory from './calendar/calendar-setting.factory';
import BlockedDateFactory from './calendar/blocked-date.factory';
import FaqFactory from './faq/faq.factory';
import NotificationTemplateFactory from './notification-template/notification-template.factory';
import PortfolioFactory from './portfolio/portfolio.factory';
import ReservationFactory from './reservation/reservation.factory';
import ReviewFactory from './review/review.factory';

export const seeds: SeederConstructor[] | string[] = [
  UserSeeder,
  ServiceSeeder,
  CalendarSeeder,
  FaqSeeder,
  NotificationTemplateSeeder,
  PortfolioSeeder,
  ReservationSeeder, // User, Service가 필요하므로 나중에 실행
  ReviewSeeder, // Reservation이 필요하므로 마지막에 실행
];

export const factories: SeederFactoryItem[] | string[] = [
  UserFactory,
  ServiceFactory,
  CalendarSettingFactory,
  BlockedDateFactory,
  FaqFactory,
  NotificationTemplateFactory,
  PortfolioFactory,
  ReservationFactory,
  ReviewFactory,
];