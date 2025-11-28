import { IsString, IsDateString, Length, Matches } from 'class-validator';

export class ValidateGuessDto {
  @IsDateString()
  puzzleDate: string;

  @IsString()
  @Length(4, 8)
  @Matches(/^[A-Z]+$/, { message: 'Guess must contain only uppercase letters' })
  guess: string;
}
