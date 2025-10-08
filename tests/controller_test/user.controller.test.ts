import request from "supertest";
import { app } from "../../src/app"; // Asegúrate de importar la instancia de tu servidor Express
import { userService } from "../../src/services/user.service";
import { UserInput } from "../../src/interfaces";
import { AuthException } from "../../src/exceptions";

// Mock del servicio de usuarios
jest.mock("../../src/services/user.service");

describe("UserController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // 🔹 GET /api/users → debería devolver todos los usuarios
    it("GET /api/users - debería devolver todos los usuarios", async () => {
        const mockUsers = [
            { id: 1, name: "John Doe", email: "john@example.com", adress: "123 Street" },
            { id: 2, name: "Jane Doe", email: "jane@example.com", adress: "456 Avenue" }
        ];
        (userService.getAllUsers as jest.Mock).mockResolvedValue(mockUsers);

        const res = await request(app).get("/api/users");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockUsers);
        expect(userService.getAllUsers).toHaveBeenCalledTimes(1);
    });

    // 🔹 GET /api/users → si no hay usuarios, debería devolver 404
    it("GET /api/users - debería devolver 404 si no hay usuarios", async () => {
        (userService.getAllUsers as jest.Mock).mockResolvedValue([]);

        const res = await request(app).get("/api/users");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ msg: "No users found" });
    });

    // 🔹 GET /api/users/:id → debería devolver un usuario por ID
    it("GET /api/users/:id - debería devolver un usuario específico", async () => {
        const mockUser = { id: 1, name: "John Doe", email: "john@example.com", adress: "123 Street" };
        (userService.getUserById as jest.Mock).mockResolvedValue(mockUser);

        const res = await request(app).get("/api/users/1");

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockUser);
    });

    // 🔹 GET /api/users/:id → si el usuario no existe, debería devolver 404

    // 🔹 POST /api/users → debería crear un usuario
    it("POST /api/users - debería crear un usuario", async () => {
        const newUser: UserInput = {
            name: "New User",
            email: "new@example.com",
            password: "password123",
            cellphone: 1234567890,
            adress: "789 Road"
        };

        (userService.createUser as jest.Mock).mockResolvedValue(undefined);

        const res = await request(app).post("/api/users").send(newUser);

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: "User created" });
    });

    // 🔹 POST /api/users → si el email ya existe, debería devolver 400
    it("POST /api/users - debería devolver 400 si el email ya está en uso", async () => {
        (userService.createUser as jest.Mock).mockRejectedValue(new Error("Email already exists"));

        const res = await request(app).post("/api/users").send({
            name: "New User",
            email: "existing@example.com",
            password: "password123",
            cellphone: 1234567890,
            adress: "789 Road"
        });

        expect(res.status).toBe(400);
    });

    // 🔹 PUT /api/users/:email → debería actualizar un usuario
    it("PUT /api/users/:email - debería actualizar un usuario", async () => {
        (userService.updateUserByEmail as jest.Mock).mockResolvedValue(undefined);

        const res = await request(app).put("/api/users/existing@example.com").send({
            name: "Updated User"
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: "User updated" });
    });

    // 🔹 PUT /api/users/:email → si el usuario no existe, debería devolver 404
    it("PUT /api/users/:email - debería devolver 404 si el usuario no existe", async () => {
        (userService.updateUserByEmail as jest.Mock).mockRejectedValue(new Error("User with email notfound@example.com not found"));

        const res = await request(app).put("/api/users/notfound@example.com").send({
            name: "Updated User"
        });

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ msg: "User with email notfound@example.com not found" });
    });

    // 🔹 DELETE /api/users/:email → debería eliminar un usuario
    it("DELETE /api/users/:email - debería eliminar un usuario", async () => {
        (userService.deleteUserByEmail as jest.Mock).mockResolvedValue(undefined);

        const res = await request(app).delete("/api/users/existing@example.com");

        expect(res.status).toBe(200);
        expect(res.body).toEqual({ msg: "User deleted" });
    });

    // 🔹 DELETE /api/users/:email → si el usuario no existe, debería devolver 404
    it("DELETE /api/users/:email - debería devolver 404 si el usuario no existe", async () => {
        (userService.deleteUserByEmail as jest.Mock).mockRejectedValue(new Error("User with email notfound@example.com not found"));

        const res = await request(app).delete("/api/users/notfound@example.com");

        expect(res.status).toBe(404);
        expect(res.body).toEqual({ msg: "User with email notfound@example.com not found" });
    });

    // 🔹 POST /api/users/login → debería loguear a un usuario y devolver un token
    it("POST /api/users/login - debería loguear a un usuario y devolver un token", async () => {
        const mockResponse = {
            user: {
                name: "John Doe",
                email: "john@example.com",
                adress: "123 Street",
                token: "mock-jwt-token",
                role: "user"
            }
        };

        (userService.logIn as jest.Mock).mockResolvedValue(mockResponse);

        const res = await request(app).post("/api/users/login").send({
            email: "john@example.com",
            password: "password123"
        });

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockResponse);
    });

    // 🔹 POST /api/users/login → si las credenciales son inválidas, debería devolver 401
    it("POST /api/users/login - debería devolver 401 si la contraseña es incorrecta", async () => {
        (userService.logIn as jest.Mock).mockRejectedValue(new AuthException("Invalid password"));

        const res = await request(app).post("/api/users/login").send({
            email: "john@example.com",
            password: "wrongpassword"
        });

        expect(res.status).toBe(401);
        expect(res.body).toEqual({ msg: "Invalid password" });
    });
});
