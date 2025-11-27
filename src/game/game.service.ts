import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DailyPuzzle, DailyPuzzleDocument } from './schemas/daily-puzzle.schema';
import { UserStats, UserStatsDocument } from './schemas/user-stats.schema';
import { SubmitGameDto } from './dto/submit-game.dto';

@Injectable()
export class GameService {
  constructor(
    @InjectModel(DailyPuzzle.name)
    private dailyPuzzleModel: Model<DailyPuzzleDocument>,
    @InjectModel(UserStats.name)
    private userStatsModel: Model<UserStatsDocument>,
  ) {}

  async getTodaysPuzzle(): Promise<any> {
    // Get today's date in UTC to avoid timezone issues
    const today = new Date();
    const todayUTC = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
    );

    const puzzle = await this.dailyPuzzleModel
      .findOne({ date: todayUTC })
      .select('-word')
      .exec();

    if (!puzzle) {
      throw new NotFoundException(
        `No puzzle available for today (${todayUTC.toISOString().split('T')[0]})`,
      );
    }

    return {
      id: puzzle._id,
      date: puzzle.date,
      category: puzzle.category,
      hint: puzzle.hint,
      difficulty: puzzle.difficulty,
      wordLength: puzzle.word ? puzzle.word.length : 5,
    };
  }

  async submitGame(userId: string, submitGameDto: SubmitGameDto): Promise<any> {
    // Parse date in UTC
    const puzzleDate = new Date(submitGameDto.puzzleDate);
    const puzzleDateUTC = new Date(
      Date.UTC(puzzleDate.getFullYear(), puzzleDate.getMonth(), puzzleDate.getDate()),
    );

    const puzzle = await this.dailyPuzzleModel.findOne({ date: puzzleDateUTC });
    if (!puzzle) {
      throw new NotFoundException(
        `Puzzle not found for date: ${puzzleDateUTC.toISOString().split('T')[0]}`,
      );
    }

    let stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      stats = new this.userStatsModel({
        userId: new Types.ObjectId(userId),
        gamesPlayed: 0,
        gamesWon: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: new Map(),
        completedPuzzles: [],
      });
    }

    // Check if already played today
    if (stats.completedPuzzles.some((id) => id.equals(puzzle._id))) {
      throw new BadRequestException('Puzzle already completed today');
    }

    // Update stats
    stats.gamesPlayed += 1;
    stats.completedPuzzles.push(puzzle._id);

    if (submitGameDto.won) {
      stats.gamesWon += 1;

      // Update guess distribution
      const attempts = submitGameDto.attempts;
      const currentCount = stats.guessDistribution.get(attempts) || 0;
      stats.guessDistribution.set(attempts, currentCount + 1);

      // Update streak
      const lastPlayed = stats.lastPlayedDate;
      const yesterday = new Date(puzzleDateUTC);
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);

      if (!lastPlayed) {
        // First game ever
        stats.currentStreak = 1;
      } else {
        const lastPlayedUTC = new Date(
          Date.UTC(
            lastPlayed.getFullYear(),
            lastPlayed.getMonth(),
            lastPlayed.getDate(),
          ),
        );

        // Check if played yesterday or today (consecutive)
        if (
          lastPlayedUTC.getTime() === yesterday.getTime() ||
          lastPlayedUTC.getTime() === puzzleDateUTC.getTime()
        ) {
          stats.currentStreak += 1;
        } else {
          // Streak broken
          stats.currentStreak = 1;
        }
      }

      if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
      }
    } else {
      stats.currentStreak = 0;
    }

    stats.lastPlayedDate = puzzleDateUTC;
    await stats.save();

    return {
      success: true,
      stats: {
        gamesPlayed: stats.gamesPlayed,
        gamesWon: stats.gamesWon,
        winPercentage: Math.round((stats.gamesWon / stats.gamesPlayed) * 100),
        currentStreak: stats.currentStreak,
        maxStreak: stats.maxStreak,
        guessDistribution: Object.fromEntries(stats.guessDistribution),
      },
    };
  }

  async getUserStats(userId: string): Promise<any> {
    const stats = await this.userStatsModel.findOne({
      userId: new Types.ObjectId(userId),
    });

    if (!stats) {
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        winPercentage: 0,
        currentStreak: 0,
        maxStreak: 0,
        guessDistribution: {},
      };
    }

    return {
      gamesPlayed: stats.gamesPlayed,
      gamesWon: stats.gamesWon,
      winPercentage:
        stats.gamesPlayed > 0
          ? Math.round((stats.gamesWon / stats.gamesPlayed) * 100)
          : 0,
      currentStreak: stats.currentStreak,
      maxStreak: stats.maxStreak,
      guessDistribution: Object.fromEntries(stats.guessDistribution),
    };
  }

  // Admin method to create puzzles
  async createPuzzle(puzzleData: any): Promise<DailyPuzzleDocument> {
    try {
      // Ensure date is in UTC
      const puzzleDate = new Date(puzzleData.date);
      const puzzleDateUTC = new Date(
        Date.UTC(puzzleDate.getFullYear(), puzzleDate.getMonth(), puzzleDate.getDate()),
      );

      // Check if puzzle already exists for this date
      const existingPuzzle = await this.dailyPuzzleModel.findOne({
        date: puzzleDateUTC,
      });

      if (existingPuzzle) {
        throw new BadRequestException(
          `A puzzle already exists for ${puzzleDateUTC.toISOString().split('T')[0]}. ` +
          `Existing puzzle: "${existingPuzzle.word}" (${existingPuzzle.category})`,
        );
      }

      const puzzle = new this.dailyPuzzleModel({
        ...puzzleData,
        date: puzzleDateUTC,
        word: puzzleData.word.toUpperCase(),
      });

      return puzzle.save();
    } catch (error) {
      if (error.code === 11000) {
        throw new BadRequestException(
          'A puzzle already exists for this date. Please choose a different date.',
        );
      }
      throw error;
    }
  }

  // Admin method to list all puzzles
  async listAllPuzzles(): Promise<any[]> {
    const puzzles = await this.dailyPuzzleModel
      .find()
      .sort({ date: 1 })
      .exec();

    return puzzles.map((puzzle) => ({
      id: puzzle._id,
      word: puzzle.word,
      date: puzzle.date,
      category: puzzle.category,
      hint: puzzle.hint,
      difficulty: puzzle.difficulty,
    }));
  }

  // Admin method to get puzzle by date
  async getPuzzleByDate(dateString: string): Promise<any> {
    const puzzleDate = new Date(dateString);
    const puzzleDateUTC = new Date(
      Date.UTC(puzzleDate.getFullYear(), puzzleDate.getMonth(), puzzleDate.getDate()),
    );

    const puzzle = await this.dailyPuzzleModel.findOne({ date: puzzleDateUTC });

    if (!puzzle) {
      throw new NotFoundException(
        `No puzzle found for ${puzzleDateUTC.toISOString().split('T')[0]}`,
      );
    }

    return {
      id: puzzle._id,
      word: puzzle.word,
      date: puzzle.date,
      category: puzzle.category,
      hint: puzzle.hint,
      difficulty: puzzle.difficulty,
    };
  }

  async validateGuess(validateGuessDto: any): Promise<any> {
    const puzzleDate = new Date(validateGuessDto.puzzleDate);
    const puzzleDateUTC = new Date(
      Date.UTC(puzzleDate.getFullYear(), puzzleDate.getMonth(), puzzleDate.getDate()),
    );

    const puzzle = await this.dailyPuzzleModel.findOne({ date: puzzleDateUTC });
    if (!puzzle) {
      throw new NotFoundException(
        `Puzzle not found for date: ${puzzleDateUTC.toISOString().split('T')[0]}`,
      );
    }

    const guess = validateGuessDto.guess.toUpperCase();
    const word = puzzle.word.toUpperCase();

    if (guess.length !== word.length) {
      throw new BadRequestException('Guess length must match word length');
    }

    // Calculate letter states
    const result = [];
    const wordLetters = word.split('');
    const guessLetters = guess.split('');
    const letterCounts = new Map<string, number>();

    // Count letters in the word
    wordLetters.forEach((letter) => {
      letterCounts.set(letter, (letterCounts.get(letter) || 0) + 1);
    });

    // First pass: mark correct positions (green)
    const states = new Array(word.length).fill('absent');
    guessLetters.forEach((letter, index) => {
      if (letter === wordLetters[index]) {
        states[index] = 'correct';
        letterCounts.set(letter, letterCounts.get(letter) - 1);
      }
    });

    // Second pass: mark present letters (yellow)
    guessLetters.forEach((letter, index) => {
      if (states[index] === 'absent' && letterCounts.get(letter) > 0) {
        states[index] = 'present';
        letterCounts.set(letter, letterCounts.get(letter) - 1);
      }
    });

    // Build result
    guessLetters.forEach((letter, index) => {
      result.push({
        letter: letter,
        state: states[index], // 'correct', 'present', or 'absent'
      });
    });

    return {
      guess: guess,
      result: result,
      isCorrect: guess === word,
    };
  }
}
