import { IsEmail, IsNotEmpty } from 'class-validator';

export class loginUser {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;
}
