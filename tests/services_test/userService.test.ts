import { userService } from "../../src/services";
import User from "../../src/models/user.model";
import { AuthException } from "../../src/exceptions";
import { error } from "console";
import bcrypt from 'bcrypt';

jest.mock("../../src/models/user.model", () => ({
  findAll: jest.fn(),
  findByPk: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
}));

describe("UserService", () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
    });

    test("getAllUsers debe devolver una lista de usuarios", async () => {
        const mockUsers = [{ id: 1, name: 'John Doe' }, { id: 2, name: 'Jane Doe' }];
        (User.findAll as jest.Mock).mockResolvedValue(mockUsers);

        const result = await userService.getAllUsers();
        expect(result).toEqual(mockUsers);
        expect(User.findAll).toHaveBeenCalledTimes(1);
    });

    test("getUserById debe devolver un usuario", async () => {
        const mockUser = { id: 1, name: 'John Doe' };
        (User.findByPk as jest.Mock).mockResolvedValue(mockUser);

        const result = await userService.getUserById('1');
        expect(result).toEqual(mockUser);
        expect(User.findByPk).toHaveBeenCalledTimes(1);
    });

    test("getUserByEmail debe devolver un usuario", async () => {
        const mockUser = { id: 1, name: 'John Doe', email: 'jhon@example.com' };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        const result = await userService.getUserByEmail('jhon@example.com');
        expect(result).toEqual(mockUser);
        expect(User.findOne).toHaveBeenCalledTimes(1);
    });

    test("createUser debe crear un nuevo usuario", async () => {
        const newUser = {
            name: 'John Doe',
            email: 'jhon@example.com',
            user_Document: '123456789',
            password: '12345678',
            cellphone: 3123431212,
            adress: 'Calle 123'
        };

        const mockCreatedUser = { id: 3, ...newUser };
        (User.findOne as jest.Mock).mockResolvedValue(null);
        (User.create as jest.Mock).mockResolvedValue(mockCreatedUser);

        const result = await userService.createUser(newUser);
        expect(result).toEqual(mockCreatedUser);
        expect(User.create).toHaveBeenCalledWith(newUser);
    });

    test("createUser debe lanzar error si el email ya existe", async () => {
        const newUser = {
            name: 'John Doe',
            email: 'jhon@example.com',
            user_Document: '123456789',
            password: '12345678',
            cellphone: 3123431212,
            adress: 'Calle 123'
        };

        (User.findOne as jest.Mock).mockResolvedValue(newUser);

        await expect(userService.createUser(newUser)).rejects.toThrow(Error);
        expect(User.findOne).toHaveBeenCalledWith({ where: { email: newUser.email } });
        expect(User.create).not.toHaveBeenCalled();
    });

    test("updateUserByEmail debe actualizar un usuario existente", async () => {
        const updatedData = { cellphone: 3123431212 };
        const mockUser = { name: 'Mario Hugo',email: 'anotalo@example.com',cellphone:1234567890, update: jest.fn() };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        await userService.updateUserByEmail('anotalo@example.com', updatedData);
        expect(mockUser.update).toHaveBeenCalledWith(updatedData);

    });

    test("updateUserByEmail debe lanzar error si el usuario no existe", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        await expect(userService.updateUserByEmail('pedro@example.com', { cellphone: 3123431212 }))
            .rejects.toThrow('User with email pedro@example.com not found');
    });

    test("deleteUserByEmail debe eliminar un usuario existente", async () => {
        const mockUser = { name: 'Juan Carlos',email: 'bodoque@gmail.com', destroy: jest.fn() };
        (User.findOne as jest.Mock).mockResolvedValue(mockUser);

        await userService.deleteUserByEmail('bodoque@gmail.com');
        expect(mockUser.destroy).toHaveBeenCalledTimes(1);
    });

    test("deleteUserByEmail debe lanzar error si el usuario no existe", async () => {
        (User.findOne as jest.Mock).mockResolvedValue(null);

        await expect(userService.deleteUserByEmail('bodoque@gmail'))
            .rejects.toThrow('User with email bodoque@gmail not found');
    });

    

    test("logIn debe lanzar error si el usuario no existe", async () => {
        const userLogin = { email: 'jhon@example', password: '12345678' };
        (User.findOne as jest.Mock).mockResolvedValue(null);

        await expect(userService.logIn(userLogin))
            .rejects.toThrow(AuthException);
    });


    
});