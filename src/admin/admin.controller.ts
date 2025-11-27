import { Controller, Post, Body, UseGuards, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameService } from '../game/game.service';
import { CreatePuzzleDto } from '../game/dto/create-puzzle.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard) // In production, add an admin role guard
export class AdminController {
  constructor(private readonly gameService: GameService) {}

  @Post('puzzle')
  createPuzzle(@Body() createPuzzleDto: CreatePuzzleDto) {
    return this.gameService.createPuzzle(createPuzzleDto);
  }

  @Get('puzzles')
  listPuzzles() {
    return this.gameService.listAllPuzzles();
  }

  @Get('puzzles/:date')
  getPuzzleByDate(@Param('date') date: string) {
    return this.gameService.getPuzzleByDate(date);
  }
}
