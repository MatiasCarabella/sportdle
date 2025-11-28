import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  healthCheck(): Object {
    return {
      message: 'Sportdle API is running! 🏎️',
      status: 'healthy',
      version: '1.0.0',
      endpoints: {
        auth: '/api/auth',
        game: '/api/game',
        admin: '/api/admin',
      },
      documentation:
        'https://documenter.getpostman.com/view/10146128/2sB3dK1Csq',
      timestamp: new Date().toISOString(),
    };
  }
}
