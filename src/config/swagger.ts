import { version } from "node:os";
import { title } from "node:process";
import swaggerJSDoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "LockedIn",
            version: "1.0.0",
        },
        servers: [
            {
                url: "http://localhost:3001",
            },
        ],
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            },
            schema: {
                User: {
                    type: "object",
                    properties: {
                        id: { 
                            type: "string", 
                            format: "uuid", 
                            description: "User unique identifier", 
                            example: "64f2ab1234abcd5678ef90"
                        },
                        email: {
                            type: "string", 
                            format: "@email.com",
                            description: "User's email",
                            example: "gojosatoru@gmail.com"
                        },
                        username: {
                            type: "string", 
                            description: "User's username",
                            example: "gojosatoru@gmail.com"
                        },
                        password: { 
                            type: "string", 
                        },
                    }
                },
                Task: {
                    type: "object",
                    properties: {
                        id: { type: "string", example: "64f2ab1234abcd5678ef90"},
                        title: { type: "string", example: "Review flutter docs"},
                        description: { type: "string", example: "Review lecturer's slides and practice"},
                        status: { type: "string", example: "pending/completed"},
                        dueDate: { type: "string", example: "2026-02-05T05:57:16.621+00:00"},
                    }
                },

            }
        }
        
    },
    apis: ["./src/routes/*.ts"],
}
export const swaggerSpec = swaggerJSDoc(options);