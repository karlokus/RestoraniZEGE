import { Controller } from "@nestjs/common";
import { AuthService } from "./providers/auth.service";


@Controller()
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}
}