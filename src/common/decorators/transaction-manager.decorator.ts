import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { QueryRunner } from 'typeorm';

export const TransactionManager = createParamDecorator(
  (_: unknown, context: ExecutionContext): QueryRunner => {
    const req = context.switchToHttp().getRequest();
    return req.queryRunner;
  },
);
