import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { loginUser } from './dto/login-user.dto';
import { User } from './entities/users.entity';

@Injectable()
export class UsersService {
  constructor(private usersRepository: UsersRepository) {}

  async createUser(userDto: CreateUserDto): Promise<User> {
    return this.usersRepository.createUser(userDto);
  }

  async loginUser(loginData: loginUser): Promise<{ accessToken: string }> {
    return this.usersRepository.loginUser(loginData);
  }

  async upgradeToPremium(id: string, user: User): Promise<User> {
    return this.usersRepository.upgradeToPremium(id, user);
  }

  async removePremium(id: string, user: User): Promise<User> {
    return this.usersRepository.removePremium(id, user);
  }

  async getPremiumUsers(user: User): Promise<User[]> {
    return this.usersRepository.getPremiumUsers(user);
  }

  async getAll(): Promise<User[]> {
    return this.usersRepository.getAll();
  }

  async getUserById(id: string): Promise<User> {
    return this.usersRepository.getUserById(id);
  }

  async updateUserById(id: string, userDto: UpdateUserDto): Promise<User> {
    return this.usersRepository.updateUserById(id, userDto);
  }

  async deleteUserById(id: string) {
    return this.usersRepository.deleteUserById(id);
  }

  async deleteAll() {
    await this.usersRepository.deleteAll();
  }
}
