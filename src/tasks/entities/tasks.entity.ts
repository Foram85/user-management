import { Exclude, Transform } from 'class-transformer';
import { User } from 'src/users/entities/users.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { TaskStatus } from '../interfaces/task-status.interface';
import { TaskPriority } from '../interfaces/task-priority.interface';

@Entity()
export class Tasks {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: TaskStatus.OPEN })
  status: TaskStatus;

  @Column()
  priority: TaskPriority;

  @Column({ type: 'int', nullable: true })
  remainingDays: number;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'created_at',
  })
  @Transform(({ value }) => formatDate(value))
  createdAt: Date;

  @CreateDateColumn({
    type: 'timestamptz',
    name: 'dead_line',
  })
  @Transform(({ value }) => formatDate(value))
  deadline: Date;

  @ManyToOne(() => User, (user) => user.tasks, { onDelete: 'CASCADE' })
  @Exclude({ toPlainOnly: true })
  user: User;
}

export const formatDate = (date: Date): string => {
  if (!date) return null;

  return new Date(date).toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};
