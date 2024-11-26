import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModule } from './user/user.module';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Load environment variables from the .env file
    ConfigModule.forRoot({
      isGlobal: true, // Makes the config accessible throughout the app
    }),
    
    // Use the environment variable for MongoDB connection
    MongooseModule.forRoot(process.env.MONGO_URI),
    
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
