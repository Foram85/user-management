import { TaskPriority } from './interfaces/task-priority.interface';
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Tasks } from './entities/tasks.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { User } from 'src/users/entities/users.entity';
import { TaskStatus } from './interfaces/task-status.interface';

@Injectable()
export class TasksRepository {
  constructor(
    @InjectRepository(Tasks)
    private tasksRepository: Repository<Tasks>,
  ) {}

  calculateTaskPriority(
    deadline: Date,
    status: TaskStatus,
  ): { priority: TaskPriority; remainingDays: number } {
    if (status === TaskStatus.DONE) {
      return { priority: TaskPriority.NONE, remainingDays: null };
    }

    // Calculate priority for non-completed tasks
    const now = new Date();
    const remainingDays = Math.ceil(
      (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );

    let priority: TaskPriority;
    if (remainingDays <= 5) {
      priority = TaskPriority.HIGH;
    } else if (remainingDays <= 10) {
      priority = TaskPriority.MEDIUM;
    } else {
      priority = TaskPriority.LOW;
    }

    return { priority, remainingDays };
  }

  async createTask(taskDto: CreateTaskDto, user: User): Promise<Tasks> {
    const deadline = new Date(taskDto.deadline);
    const { priority, remainingDays } = this.calculateTaskPriority(
      deadline,
      taskDto.status,
    );

    const newTask = this.tasksRepository.create({
      ...taskDto,
      priority,
      remainingDays,
      user,
    });

    await this.tasksRepository.save(newTask);
    return this.getTaskById(newTask.id, user);
  }

  async getAll(filterDto: UpdateTaskDto, user: User): Promise<Tasks[]> {
    const { status, search } = filterDto;
    const query = this.tasksRepository.createQueryBuilder('tasks');
    query.where({ user });
    if (status) {
      query.andWhere('tasks.status = :status', { status });
    }
    if (search) {
      query.andWhere(
        '(tasks.title LIKE :search OR tasks.description LIKE :search)',
        { search: `%${search}%` },
      );
    }
    try {
      const tasks = await query.getMany();
      // Update priority and remaining days for each task
      tasks.map((task) => {
        const { priority, remainingDays } = this.calculateTaskPriority(
          task.deadline,
          task.status,
        );
        task.priority = priority;
        task.remainingDays = remainingDays;
      });
      tasks.sort((a, b) => {
        if (a.remainingDays === null) return 1; // Move null values to the end
        if (b.remainingDays === null) return -1;
        return a.remainingDays - b.remainingDays;
      });
      return tasks;
    } catch {
      throw new InternalServerErrorException();
    }
  }

  async getTaskById(id: string, user: User): Promise<Tasks> {
    const task = await this.tasksRepository.findOne({
      where: { id, user: { id: user.id } },
    });

    if (!task) {
      throw new NotFoundException(`Task with id ${id} not found`);
    }

    // Update priority and remaining days before returning
    const { priority, remainingDays } = this.calculateTaskPriority(
      task.deadline,
      task.status,
    );
    task.priority = priority;
    task.remainingDays = remainingDays;

    return task;
  }

  async updateTaskById(
    id: string,
    taskDto: UpdateTaskDto,
    user: User,
  ): Promise<Tasks> {
    const existingTask = await this.getTaskById(id, user);
    Object.assign(existingTask, taskDto);

    // Recalculate priority if deadline is updated
    if (taskDto['deadline']) {
      const { priority, remainingDays } = this.calculateTaskPriority(
        taskDto.deadline ? new Date(taskDto.deadline) : existingTask.deadline,
        taskDto.status || existingTask.status,
      );
      existingTask.priority = priority;
      existingTask.remainingDays = remainingDays;
    }

    await this.tasksRepository.save(existingTask);
    return this.getTaskById(id, user);
  }

  async deleteTaskById(id: string, user: User) {
    const task = await this.getTaskById(id, user);
    await this.tasksRepository.remove(task);
  }

  async deleteAll(user: User) {
    await this.tasksRepository.delete({ user });
  }
}
