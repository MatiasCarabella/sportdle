import { Controller, Get } from '@nestjs/common';

interface HealthCheckResponse {
  message: string;
  status: string;
  version: string;
  endpoints: {
    auth: string;
    game: string;
    admin: string;
  };
  documentation: string;
  timestamp: string;
}

@Controller()
export class AppController {
  @Get(['/', 'api'])
  healthCheck(): HealthCheckResponse {
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
