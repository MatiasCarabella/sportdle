import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a health check JSON', () => {
      const response = appController.healthCheck();
      expect(response).toEqual({
        message: 'Nest up and running!',
        status: 'healthy',
        timestamp: expect.any(String), // Expecting a string timestamp
      });
    });
  });
});
