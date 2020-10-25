import { Controller, Get } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppService } from './app.service';
import { CreateServiceDTO } from './DTOs/CreateUserDTO';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @MessagePattern("newUser")
  async createUser(@Payload() dtoUser: CreateServiceDTO): Promise<boolean>{
    console.log(dtoUser);
    return true;
  }
}
