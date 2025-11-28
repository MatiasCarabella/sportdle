import {
  IsString,
  IsEnum,
  IsDateString,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';

export class UpdatePuzzleDto {
  @IsString()
  @Length(4, 8)
  @Matches(/^[A-Z]+$/, { message: 'Word must contain only uppercase letters' })
  @IsOptional()
  word?: string;

  @IsDateString()
  @IsOptional()
  date?: string;

  @IsEnum(['driver', 'team', 'circuit', 'term'])
  @IsOptional()
  category?: string;

  @IsString()
  @IsOptional()
  hint?: string;

  @IsEnum(['easy', 'medium', 'hard'])
  @IsOptional()
  difficulty?: string;
}
