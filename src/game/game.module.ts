import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { DailyPuzzle, DailyPuzzleSchema } from './schemas/daily-puzzle.schema';
import { UserStats, UserStatsSchema } from './schemas/user-stats.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: DailyPuzzle.name, schema: DailyPuzzleSchema },
      { name: UserStats.name, schema: UserStatsSchema },
    ]),
  ],
  controllers: [GameController],
  providers: [GameService],
  exports: [GameService],
})
export class GameModule {}
