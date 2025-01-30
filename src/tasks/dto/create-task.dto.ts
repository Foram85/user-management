import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  MinLength,
} from 'class-validator';
import { TaskStatus } from '../interfaces/task-status.interface';
import { Transform } from 'class-transformer';

export class CreateTaskDto {
  @IsNotEmpty()
  @MinLength(5)
  title: string;

  @IsNotEmpty()
  @MinLength(8)
  description: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsNotEmpty()
  deadline: Date;
}
