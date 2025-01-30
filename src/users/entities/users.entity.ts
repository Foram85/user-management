/* eslint-disable @typescript-eslint/no-unused-vars */
import { Exclude, Transform } from 'class-transformer';
import { Tasks } from 'src/tasks/entities/tasks.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  email: string;

  @Column()
  username: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  hasPremium: boolean;

  @OneToMany(() => Tasks, (task) => task.user, { eager: true })
  @Transform(({ value }) => {
    if (!value) return value;
    return value.map(({ priority, remainingDays, ...task }) => task);
  })
  tasks: Tasks[];
}
