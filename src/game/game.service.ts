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

    let puzzle = await this.dailyPuzzleModel
      .findOne({ date: todayUTC })
      .select('-word')
      .exec();

    // If no puzzle for today, get a random one
    if (!puzzle) {
      const count = await this.dailyPuzzleModel.countDocuments();
      if (count === 0) {
        throw new NotFoundException('No puzzles available in database');
      }
      
      const random = Math.floor(Math.random() * count);
      puzzle = await this.dailyPuzzleModel
        .findOne()
        .skip(random)
        .select('-word')
        .exec();
    }

    return {
      id: puzzle._id,
      date: puzzle.date,
      category: puzzle.category,
      hint: puzzle.hint,
      difficulty: puzzle.difficulty,
      wordLength: puzzle.word ? puzzle.word.length : 5,
      isRandom: puzzle.date.getTime() !== todayUTC.getTime(),
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

      // Update guess distribution (Map requires string keys)
      const attempts = submitGameDto.attempts.toString();
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
      const wordUpper = puzzleData.word.toUpperCase();

      // Check if this word already exists
      const existingPuzzleByWord = await this.dailyPuzzleModel.findOne({
        word: wordUpper,
      });

      if (existingPuzzleByWord) {
        throw new BadRequestException(
          `The word "${wordUpper}" already exists as a puzzle for ${existingPuzzleByWord.date.toISOString().split('T')[0]}. ` +
          `Please choose a different word.`,
        );
      }

      let puzzleDateUTC: Date;

      // If no date provided, find the next available date
      if (!puzzleData.date) {
        // Get the latest puzzle date
        const latestPuzzle = await this.dailyPuzzleModel
          .findOne()
          .sort({ date: -1 })
          .exec();

        if (latestPuzzle) {
          // Add one day to the latest puzzle date
          puzzleDateUTC = new Date(latestPuzzle.date);
          puzzleDateUTC.setUTCDate(puzzleDateUTC.getUTCDate() + 1);
        } else {
          // No puzzles exist, start from today
          const today = new Date();
          puzzleDateUTC = new Date(
            Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()),
          );
        }
      } else {
        // Use provided date
        const puzzleDate = new Date(puzzleData.date);
        puzzleDateUTC = new Date(
          Date.UTC(puzzleDate.getFullYear(), puzzleDate.getMonth(), puzzleDate.getDate()),
        );

        // Check if puzzle already exists for this date
        const existingPuzzleByDate = await this.dailyPuzzleModel.findOne({
          date: puzzleDateUTC,
        });

        if (existingPuzzleByDate) {
          throw new BadRequestException(
            `A puzzle already exists for ${puzzleDateUTC.toISOString().split('T')[0]}. ` +
            `Existing puzzle: "${existingPuzzleByDate.word}" (${existingPuzzleByDate.category})`,
          );
        }
      }

      const puzzle = new this.dailyPuzzleModel({
        ...puzzleData,
        date: puzzleDateUTC,
        word: wordUpper,
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

  // Admin method to update a puzzle
  async updatePuzzle(id: string, updateData: any): Promise<DailyPuzzleDocument> {
    const puzzle = await this.dailyPuzzleModel.findById(id);
    
    if (!puzzle) {
      throw new NotFoundException(`Puzzle with ID ${id} not found`);
    }

    // If updating the word, check for duplicates and ensure uppercase
    if (updateData.word) {
      const wordUpper = updateData.word.toUpperCase();

      // Check if another puzzle exists with this word (excluding current puzzle)
      const existingPuzzleByWord = await this.dailyPuzzleModel.findOne({
        word: wordUpper,
        _id: { $ne: id },
      });

      if (existingPuzzleByWord) {
        throw new BadRequestException(
          `The word "${wordUpper}" already exists as a puzzle for ${existingPuzzleByWord.date.toISOString().split('T')[0]}. ` +
          `Please choose a different word.`,
        );
      }

      updateData.word = wordUpper;
    }

    // If updating the date, check for duplicates
    if (updateData.date) {
      const newDate = new Date(updateData.date);
      const newDateUTC = new Date(
        Date.UTC(newDate.getFullYear(), newDate.getMonth(), newDate.getDate()),
      );

      // Check if another puzzle exists for this date (excluding current puzzle)
      const existingPuzzleByDate = await this.dailyPuzzleModel.findOne({
        date: newDateUTC,
        _id: { $ne: id },
      });

      if (existingPuzzleByDate) {
        throw new BadRequestException(
          `A puzzle already exists for ${newDateUTC.toISOString().split('T')[0]}. ` +
          `Existing puzzle: "${existingPuzzleByDate.word}" (${existingPuzzleByDate.category})`,
        );
      }

      updateData.date = newDateUTC;
    }

    Object.assign(puzzle, updateData);
    return puzzle.save();
  }

  // Admin method to delete a puzzle
  async deletePuzzle(id: string): Promise<{ message: string }> {
    const result = await this.dailyPuzzleModel.findByIdAndDelete(id);
    
    if (!result) {
      throw new NotFoundException(`Puzzle with ID ${id} not found`);
    }

    return {
      message: `Puzzle "${result.word}" for ${result.date.toISOString().split('T')[0]} deleted successfully`,
    };
  }
}
