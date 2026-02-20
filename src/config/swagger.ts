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
                Step: {
                    type: "object",
                    properties: {
                        step: { type: "number", example: 1 },
                        title: { type: "string", example: "Setup project structure" },
                        description: { type: "string", example: "Create folder hierarchy and initialize git repo" }
                    }
                },
                PlannedResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["planned"], example: "planned" },
                        steps: {
                            type: "array",
                            items: { "$ref": "#/components/schema/Step" }
                        }
                    }
                },
                ClarificationResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["clarification_required"], example: "clarification_required" },
                        steps: { type: "array", items: {}, example: [] },
                        clarification_question: { type: "string", example: "What is the target platform for this app?" }
                    }
                },
                UnsupportedResponse: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["unsupported_request"], example: "unsupported_request" }
                    }
                },
                ChatResponse: {
                    type: "object",
                    properties: {
                        chatId: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k" },
                        response: {
                            oneOf: [
                                { "$ref": "#/components/schema/PlannedResponse" },
                                { "$ref": "#/components/schema/ClarificationResponse" },
                                { "$ref": "#/components/schema/UnsupportedResponse" }
                            ]
                        }
                    }
                },
                ChatMessage: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k" },
                        chatId: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k" },
                        role: { type: "string", enum: ["system", "user", "assistant"], example: "user" },
                        type: { type: "string", enum: ["goal", "breakdown", "refinement", "clarification"], example: "goal" },
                        content: { type: "string", example: "Build a personal finance tracker app" },
                        createdAt: { type: "string", format: "date-time", example: "2026-02-20T10:00:00.000Z" }
                    }
                },
                ChatSession: {
                    type: "object",
                    properties: {
                        _id: { type: "string", example: "65a1b2c3d4e5f6g7h8i9j0k" },
                        userId: { type: "string", example: "64f2ab1234abcd5678ef90" },
                        title: { type: "string", example: "Build a personal finance tracker app" },
                        status: { type: "string", enum: ["planned", "clarification_required"], example: "planned" },
                        createdAt: { type: "string", format: "date-time", example: "2026-02-20T10:00:00.000Z" },
                        updatedAt: { type: "string", format: "date-time", example: "2026-02-20T10:05:00.000Z" },
                        messages: {
                            type: "array",
                            items: { "$ref": "#/components/schema/ChatMessage" }
                        }
                    }
                },

            }
        }
        
    },
    apis: ["./src/routes/*.ts"],
}
export const swaggerSpec = swaggerJSDoc(options);