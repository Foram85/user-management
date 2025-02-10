import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  Param,
  Patch,
  UseGuards,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Tasks } from './entities/tasks.entity';
import { UpdateTaskDto } from 'src/Tasks/dto/update-Task.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from 'src/users/get-user.decorator';
import { User } from 'src/users/entities/users.entity';
import { premiumGuard } from 'src/users/premium.guard';
import { RequirePremium } from 'src/users/get-premium.decorator';

@Controller('tasks')
@UseGuards(AuthGuard())
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Post('register')
  createTask(
    @Body() taskDto: CreateTaskDto,
    @GetUser() user: User,
  ): Promise<Tasks> {
    return this.tasksService.createTask(taskDto, user);
  }

  @Get()
  getTasks(
    @Query() filterDto: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Tasks[]> {
    return this.tasksService.getAll(filterDto, user);
  }

  @Get(':id')
  getTaskById(@Param('id') id: string, @GetUser() user: User): Promise<Tasks> {
    return this.tasksService.getTaskById(id, user);
  }

  @Patch(':id')
  UpdateTaskById(
    @Param('id') id: string,
    @Body() taskDto: UpdateTaskDto,
    @GetUser() user: User,
  ): Promise<Tasks> {
    return this.tasksService.updateTaskById(id, taskDto, user);
  }

  @Delete(':id')
  async deleteTaskById(
    @Param('id') id: string,
    @GetUser() user: User,
  ): Promise<{ message: string }> {
    await this.tasksService.deleteTaskById(id, user);
    return Promise.resolve({
      message: `Task deleted`,
    });
  }

  @Delete()
  async deleteAll(@GetUser() user: User): Promise<string> {
    await this.tasksService.deleteAll(user);
    return `All tasks of ${user.username} is deleted`;
  }

  //Premium
  @Get(':id/premium-feature')
  @UseGuards(premiumGuard)
  @RequirePremium()
  getPremiumFeature(@Param('id') id: string, @GetUser() user: User) {
    if (user.id !== id) {
      throw new ForbiddenException(
        'You can only access your own premium features',
      );
    }
    return {
      message: `Premium features accessed successfully by ${user.username}`,
      features: [
        'Advanced task analytics',
        'Unlimited tasks',
        'Priority support',
      ],
    };
  }
}
