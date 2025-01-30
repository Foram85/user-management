import { Injectable } from '@nestjs/common';
import { TasksRepository } from './tasks.repository';
import { CreateTaskDto } from './dto/create-task.dto';
import { Tasks } from './entities/tasks.entity';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/entities/users.entity';

@Injectable()
export class TasksService {
  constructor(private tasksRepository: TasksRepository) {}

  async createTask(taskDto: CreateTaskDto, user: User): Promise<Tasks> {
    return this.tasksRepository.createTask(taskDto, user);
  }

  async getTasks(filterDto: UpdateTaskDto, user: User): Promise<Tasks[]> {
    return this.tasksRepository.getAll(filterDto, user);
  }

  async getTaskById(id: string, user: User): Promise<Tasks> {
    return this.tasksRepository.getTaskById(id, user);
  }

  async updateTaskById(
    id: string,
    taskDto: UpdateTaskDto,
    user: User,
  ): Promise<Tasks> {
    return this.tasksRepository.updateTaskById(id, taskDto, user);
  }

  async deleteTaskById(id: string, user: User) {
    return this.tasksRepository.deleteTaskById(id, user);
  }

  async deleteAll(user: User) {
    await this.tasksRepository.deleteAll(user);
  }
}
