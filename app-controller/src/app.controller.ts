import * as bcrypt from "bcrypt";
import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { CreateUserDTO } from './DTOs/CreateUserDTO';
import { Md5 } from "ts-md5";

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
    // gets the current date, when the user is being created
    const created = new Date();

    //the date from string to Date object to preserve the type
    const birthDate = new Date(createUserDTO.birthDate);
    createUserDTO.birthDate = birthDate;

    // hashes the email to generate a user ID
    const md5 = Md5.hashStr(createUserDTO.email);

    // hashes the user password
    createUserDTO.password = await bcrypt.hash(
      createUserDTO.password,
      this.saltRounds
    );

    console.log({dto: createUserDTO, md5: md5, created:created});
    
    return "User created";
  }
}
