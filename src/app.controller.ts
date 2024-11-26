import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor() {}

  @Get()
  healthCheck(): Object {
    return {
      message: 'Nest up and running!',
      status: 'healthy',
      timestamp: new Date().toISOString(),
    };
  }
}
