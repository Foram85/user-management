import { forwardRef, Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Tasks } from './entities/tasks.entity';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Tasks]), forwardRef(() => UsersModule)],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
