import { Request } from 'express';
import { AuthService } from './auth.service';
import { LoginDto, LoginResponseDto } from './dto/login.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, request: Request): Promise<LoginResponseDto>;
    logout(request: any): Promise<{
        message: string;
    }>;
}
