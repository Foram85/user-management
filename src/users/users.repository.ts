import { JwtService } from '@nestjs/jwt';
import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/users.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { loginUser } from './dto/login-user.dto';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async getAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async createUser(userDto: CreateUserDto): Promise<User> {
    const existingUser = await this.findByEmail(userDto.email);

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userDto.password, 10);
    const newUser = this.userRepository.create({
      ...userDto,
      password: hashedPassword,
    });

    return this.userRepository.save(newUser);
  }

  async loginUser(loginData: loginUser): Promise<{ accessToken: string }> {
    const user = await this.findByEmail(loginData.email);

    if (!user || !(await bcrypt.compare(loginData.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: 'Ironwoman890',
      expiresIn: '1h',
    });

    return { accessToken };
  }

  async upgradeToPremium(id: string, user: User): Promise<User> {
    if (user.id !== id) {
      throw new UnauthorizedException('You can only upgrade your own account');
    }
    const existingUser = await this.getUserById(id);
    existingUser.hasPremium = true;
    return this.userRepository.save(existingUser);
  }

  async removePremium(id: string, user: User): Promise<User> {
    if (user.id !== id) {
      throw new UnauthorizedException(
        'You can only remove premium from your own account',
      );
    }
    const existingUser = await this.getUserById(id);
    existingUser.hasPremium = false;
    return this.userRepository.save(existingUser);
  }

  async getPremiumUsers(user: User): Promise<User[]> {
    if (user.hasPremium == false) {
      return [];
    }
    return this.userRepository.find({ where: { hasPremium: true } });
  }

  async updateUserById(id: string, userDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.getUserById(id);
    if (userDto.password) {
      userDto.password = await bcrypt.hash(userDto.password, 10);
    }

    Object.assign(existingUser, userDto);
    return this.userRepository.save(existingUser);
  }

  async deleteUserById(id: string) {
    const user = await this.getUserById(id);
    await this.userRepository.remove(user);
  }

  async deleteAll() {
    await this.userRepository.delete({});
  }
}
