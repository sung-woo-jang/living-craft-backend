import { PartialType } from '@nestjs/swagger';
import { ServiceBaseDto } from '../base/service-base.dto';

export class UpdateServiceDto extends PartialType(ServiceBaseDto) {}
