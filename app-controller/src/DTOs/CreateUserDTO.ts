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