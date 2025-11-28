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
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { GameService } from '../game/game.service';
import { UserService } from '../user/user.service';
import { CreatePuzzleDto } from '../game/dto/create-puzzle.dto';
import { UpdatePuzzleDto } from '../game/dto/update-puzzle.dto';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin')
export class AdminController {
  constructor(
    private readonly gameService: GameService,
    private readonly userService: UserService,
  ) {}

  // Puzzle Management
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

  // User Management
  @Get('users')
  findAllUsers() {
    return this.userService.findAll();
  }

  @Get('users/:id')
  findOneUser(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch('users/:id')
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Delete('users/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
