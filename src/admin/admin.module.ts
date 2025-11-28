import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { GameModule } from '../game/game.module';
import { UserModule } from '../user/user.module';

@Module({
  imports: [GameModule, UserModule],
  controllers: [AdminController],
})
export class AdminModule {}
