import { IsDate, IsEnum, IsNotEmpty } from 'class-validator';
import { MinLength } from 'class-validator';
import { IsOptional } from 'class-validator';
import { TaskStatus } from '../interfaces/task-status.interface';
import { Transform } from 'class-transformer';

export class UpdateTaskDto {
  @IsOptional()
  @IsNotEmpty()
  @MinLength(5)
  title?: string;

  @IsOptional()
  @IsNotEmpty()
  @MinLength(8)
  description?: string;

  @IsOptional()
  @IsEnum(TaskStatus)
  status?: TaskStatus;

  @Transform(({ value }) => new Date(value))
  @IsDate()
  @IsOptional()
  @IsNotEmpty()
  deadline?: Date;

  @IsOptional()
  search?: string;
}
