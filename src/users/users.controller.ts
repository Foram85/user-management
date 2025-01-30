import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { User } from './entities/users.entity';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { loginUser } from './dto/login-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  createUser(@Body() userDto: CreateUserDto): Promise<User> {
    return this.usersService.createUser(userDto);
  }

  @Post('login')
  loginUser(@Body() loginData: loginUser): Promise<{ accessToken: string }> {
    return this.usersService.loginUser(loginData);
  }

  @UseGuards(AuthGuard())
  @Patch(':id/upgrade-premium')
  upgradeToPremium(@Param('id') id: string, @Req() req) {
    return this.usersService.upgradeToPremium(id, req.user);
  }

  @UseGuards(AuthGuard())
  @Patch(':id/remove-premium')
  removePremium(@Param('id') id: string, @Req() req) {
    return this.usersService.removePremium(id, req.user);
  }

  @Get()
  getUser(): Promise<User[]> {
    return this.usersService.getAll();
  }

  @Get('has-premium')
  getPremiumUsers(@Body() user: User): Promise<User[]> {
    return this.usersService.getPremiumUsers(user);
  }

  @Get(':id')
  getUserById(@Param('id') id: string): Promise<User> {
    return this.usersService.getUserById(id);
  }

  @Patch(':id')
  UpdateUserById(
    @Param('id') id: string,
    @Body() userDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUserById(id, userDto);
  }

  @Delete(':id')
  async deleteUserById(
    @Param('id') id: string,
    user: User,
  ): Promise<{ message: string }> {
    await this.usersService.deleteUserById(id);
    return Promise.resolve({
      message: `${user.username} deleted`,
    });
  }

  @Delete()
  async deleteAll(): Promise<string> {
    await this.usersService.deleteAll();
    return 'All users are deleted';
  }
}
