import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GameService } from '../game/game.service';
import { CreatePuzzleDto } from '../game/dto/create-puzzle.dto';
import { UpdatePuzzleDto } from '../game/dto/update-puzzle.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard) // TODO: Add admin role guard for production
export class AdminController {
  constructor(private readonly gameService: GameService) {}

  @Post('puzzles')
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

  @Patch('puzzles/:id')
  updatePuzzle(@Param('id') id: string, @Body() updatePuzzleDto: UpdatePuzzleDto) {
    return this.gameService.updatePuzzle(id, updatePuzzleDto);
  }

  @Delete('puzzles/:id')
  deletePuzzle(@Param('id') id: string) {
    return this.gameService.deletePuzzle(id);
  }
}
