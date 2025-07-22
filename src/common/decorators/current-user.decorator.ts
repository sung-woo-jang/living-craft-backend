import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export interface CurrentUserType {
  id: string;
  email?: string;
  role: string;
}

export const CurrentUser = createParamDecorator(
  (
    data: keyof CurrentUserType | undefined,
    context: ExecutionContext,
  ): CurrentUserType | any => {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return null;
    }

    return data ? user[data] : user;
  },
);
