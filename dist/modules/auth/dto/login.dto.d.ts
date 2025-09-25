export declare class LoginDto {
    email: string;
    password: string;
}
export declare class LoginResponseDto {
    token: string;
    userId: string;
    email: string;
    expiresAt: Date;
}
