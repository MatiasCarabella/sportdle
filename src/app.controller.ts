import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get(['/', 'api'])
  healthCheck() {
    return {
      message: 'Sportdle API is running! 🏎️',
      status: 'healthy',
      version: '1.0.0',
      documentation:
        'https://documenter.getpostman.com/view/10146128/2sB3dK1Csq',
      timestamp: new Date().toISOString(),
    };
  }
}
