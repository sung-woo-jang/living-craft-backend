import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Portfolio } from '@modules/portfolios/entities';
import { AdminPortfoliosController } from './admin-portfolios.controller';
import { AdminPortfoliosService } from './admin-portfolios.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
  controllers: [AdminPortfoliosController],
  providers: [AdminPortfoliosService],
  exports: [AdminPortfoliosService],
})
export class AdminPortfoliosModule {}
