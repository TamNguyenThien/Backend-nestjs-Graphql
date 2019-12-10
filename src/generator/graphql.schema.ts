
/** ------------------------------------------------------
 * THIS FILE WAS AUTOMATICALLY GENERATED (DO NOT MODIFY)
 * -------------------------------------------------------
 */

/* tslint:disable */
export enum Gender {
    UNKNOWN = "UNKNOWN",
    MALE = "MALE",
    FEMALE = "FEMALE"
}

export enum Type {
    VERIFY_EMAIL = "VERIFY_EMAIL",
    FORGOT_PASSWORD = "FORGOT_PASSWORD"
}

export class CreateEmailInput {
    userId: string;
    type: Type;
}

export class CreateUserInput {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
}

export class LoginUserInput {
    username: string;
    password: string;
}

export class UpdateUserInput {
    username: string;
    password: string;
    firstname: string;
    lastname: string;
    email: string;
}

export class Email {
    _id: string;
    userId: string;
    type: Type;
    isOpened: boolean;
    createdAt: number;
    updatedAt: number;
}

export class LoginReponse {
    accessToken: string;
}

export class LoginResponse {
    accessToken: string;
    refreshToken: string;
}

export abstract class IMutation {
    abstract createEmail(input: CreateEmailInput): Email | Promise<Email>;

    abstract openEmail(_id: string): boolean | Promise<boolean>;

    abstract refreshToken(refreshToken: string): RefreshTokenResponse | Promise<RefreshTokenResponse>;

    abstract createUser(input: CreateUserInput): boolean | Promise<boolean>;

    abstract updateUser(_id: string, input: UpdateUserInput): boolean | Promise<boolean>;

    abstract deleteUser(_id: string): boolean | Promise<boolean>;

    abstract verifyEmail(emailToken: string): boolean | Promise<boolean>;

    abstract login(input: LoginUserInput): LoginResponse | Promise<LoginResponse>;

    abstract changePassword(username: string, password: string): boolean | Promise<boolean>;

    abstract forgotPassword(email: string): boolean | Promise<boolean>;

    abstract resetPassword(resetPasswordToken: string, password: string): boolean | Promise<boolean>;
}

export abstract class IQuery {
    abstract emails(): Email[] | Promise<Email[]>;

    abstract hello(): string | Promise<string>;

    abstract login(): LoginReponse | Promise<LoginReponse>;

    abstract users(): User[] | Promise<User[]>;

    abstract today(): Date | Promise<Date>;

    abstract user(_id: string): User | Promise<User>;
}

export class RefreshTokenResponse {
    accessToken: string;
}

export class User {
    _id: string;
    email?: string;
    firstname?: string;
    lastname?: string;
    username?: string;
    password?: string;
    resetPasswordToken?: string;
    resetPasswordExpires?: number;
    createdAt?: number;
    updatedAt?: number;
    isLocked?: boolean;
    isVerified?: boolean;
    isActive?: boolean;
}

export type JSON = any;
export type JSONObject = any;
