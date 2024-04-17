import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEmpty, IsNotEmpty, Length } from 'class-validator';
import { isUnique } from 'utils/validation';

export class SignUpDto {
  @ApiProperty()
  @isUnique({ tableName: 'user', column: 'email' })
  @IsEmail({}, { message: 'Incorrect email' })
  @IsNotEmpty({ message: 'The email is required' })
  email: string;

  @ApiProperty()
  @Length(6, 30, {
    message:
      'The password must be at least 6 but not longer than 30 characters',
  })
  @IsNotEmpty({ message: 'The password is required' })
  password: string;

  @ApiProperty()
  fullName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'The first name is required' })
  firstName: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'The last name is required' })
  lastName: string;

  @ApiProperty({ default: 'GUEST' })
  role: string;

  @ApiProperty()
  @IsEmpty()
  refreshToken: string;
}

export class SignInDto {
  @ApiProperty()
  @IsNotEmpty({ message: 'The email is required' })
  email: string;

  @ApiProperty()
  @IsNotEmpty({ message: 'The password is required' })
  password: string;
}
