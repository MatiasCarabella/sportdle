import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { GameService } from './game.service';
import { SubmitGameDto } from './dto/submit-game.dto';
import { ValidateGuessDto } from './dto/validate-guess.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Get('today')
  getTodaysPuzzle() {
    return this.gameService.getTodaysPuzzle();
  }

  @UseGuards(JwtAuthGuard)
  @Post('submit')
  submitGame(@Req() req, @Body() submitGameDto: SubmitGameDto) {
    return this.gameService.submitGame(req.user.userId, submitGameDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  getUserStats(@Req() req) {
    return this.gameService.getUserStats(req.user.userId);
  }

  @Post('validate')
  validateGuess(@Body() validateGuessDto: ValidateGuessDto) {
    return this.gameService.validateGuess(validateGuessDto);
  }
}
