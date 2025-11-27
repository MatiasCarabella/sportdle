import { IsNumber, IsBoolean, Min, Max, IsDateString } from 'class-validator';

export class SubmitGameDto {
  @IsDateString()
  puzzleDate: string;

  @IsBoolean()
  won: boolean;

  @IsNumber()
  @Min(1)
  @Max(6)
  attempts: number;
}
