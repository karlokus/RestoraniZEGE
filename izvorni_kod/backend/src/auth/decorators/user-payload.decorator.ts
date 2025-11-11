import { ExecutionContext, createParamDecorator } from '@nestjs/common';

import { UserPayloadData } from '../interfaces/user-payload-data.interface';
import { REQUEST_USER_KEY } from '../constants/auth.constants';

export const UserPayload = createParamDecorator(
    (field: keyof UserPayloadData | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user: UserPayloadData = request[REQUEST_USER_KEY];

        // If a user passes a field to the decorator use only that field
        return field ? user?.[field] : user;
    },
);