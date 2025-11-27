import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class CreatePuzzleDto {
  @IsString()
  @Length(5, 5)
  @Matches(/^[A-Z]+$/, { message: 'Word must contain only uppercase letters' })
  word: string;

  @IsDateString()
  date: string;

  @IsEnum(['driver', 'team', 'circuit', 'term'])
  category: string;

  @IsOptional()
  @IsString()
  hint?: string;

  @IsEnum(['easy', 'medium', 'hard'])
  difficulty: string;
}
