/**
 * this is the DTO template used when
 * receiving the information to the 
 * microservice.
 */
export interface CreateServiceDTO {
    email: string,
    name: string,
    lastname: string,
    birthDate: Date,
    password: string,
    user_id: string,
    created: Date
}