import { UserRole } from "src/users/enums/userRole.enum";

export interface UserPayloadData {
    sub: number,
    email: string,
    role: UserRole,
    isBlocked: boolean,
}