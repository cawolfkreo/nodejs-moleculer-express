import { Body, Controller, Get, Post } from "@nestjs/common";
import { AppService } from "./app.service";
import { CreateUserDTO } from "./DTOs/CreateUserDTO";

@Controller("user")
export class AppController {
  /**
   * The number of salt rounds for bcrypt.
   */
  saltRounds = 10;

  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("/registerUser")
  async createUser(@Body() createUserDTO: CreateUserDTO): Promise<string> {
    return this.appService.createUser(createUserDTO);
  }
}
