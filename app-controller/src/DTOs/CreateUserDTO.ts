/**
 * This is the template for the DTO
 * expected when receiving a new user
 * request.
 */
export interface CreateUserDTO {
    email: string,
    name: string,
    lastname: string,
    birthDate: Date,
    password: string,
}

/**
 * this is the DTO template used when
 * sending the information to the 
 * microservice.
 */
export interface CreateServiceDTO extends CreateUserDTO{
    user_id: string,
    created: Date
}