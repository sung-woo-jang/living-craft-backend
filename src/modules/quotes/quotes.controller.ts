import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { QuotesService } from './quotes.service';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quotesService: QuotesService) {}

  // TODO: Implement quotes controller methods
}
