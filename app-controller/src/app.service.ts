import { Injectable } from '@nestjs/common';
import * as bcrypt from "bcrypt";
import { CreateServiceDTO, CreateUserDTO } from "./DTOs/CreateUserDTO";
import { Md5 } from "ts-md5";

@Injectable()
export class AppService {
  /**
   * The number of salt rounds for bcrypt.
   */
  saltRounds = 10;

  getHello(): string {
    return "Hello World!";
  }

  /**
   * Converts the CreateUserDTO obj into a CreateServiceDTO and sends it
   * to the microservice.
   * @param createUserDTO The user DTO object received from the http request
   */
  async createUser(createUserDTO: CreateUserDTO): Promise<string> {
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
    
    // This DTO will be sent to the microservice
    const dtoForService: CreateServiceDTO = {
      email: createUserDTO.email,
      name: createUserDTO.name,
      lastname: createUserDTO.lastname,
      birthDate: createUserDTO.birthDate,
      created: created,
      password: createUserDTO.password,
      user_id: md5.toString()

    };

    console.log(dtoForService);

    return "user created";
  }
}
