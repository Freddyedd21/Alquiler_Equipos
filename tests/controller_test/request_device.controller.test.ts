import request from "supertest";
import {app} from "../../src/app"; // Asegúrate de importar la instancia de Express
import { requestDeviceService } from "../../src/services";
import RequestDevice from "../../src/models/request_device.model";

// Simulamos las funciones del servicio
jest.mock("../../src/services");

describe("RequestDeviceController", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe("GET /api/request_devices", () => {
        it("debería devolver 404 si no hay dispositivos en solicitudes", async () => {
            (requestDeviceService.getAllRequestDevices as jest.Mock).mockResolvedValue([]);
            const response = await request(app).get("/api/request_devices");
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ msg: "No request devices found" });
        });

        it("debería devolver la lista de request devices si existen", async () => {
            const mockDevices = [{ id: 1, request_id: 1, deviceName: "Laptop", quantity: 2 }];
            (requestDeviceService.getAllRequestDevices as jest.Mock).mockResolvedValue(mockDevices);

            const response = await request(app).get("/api/request_devices");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDevices);
        });
    });

    describe("GET /api/request_devices/:id", () => {
        it("debería devolver 404 si el dispositivo no existe", async () => {
            (requestDeviceService.getRequestDeviceById as jest.Mock).mockResolvedValue(null);
            const response = await request(app).get("/api/request_devices/99");
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ msg: "Request device with id 99 not found" });
        });

        it("debería devolver el request device si existe", async () => {
            const mockDevice = { id: 1, request_id: 1, deviceName: "Laptop", quantity: 2 };
            (requestDeviceService.getRequestDeviceById as jest.Mock).mockResolvedValue(mockDevice);

            const response = await request(app).get("/api/request_devices/1");
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockDevice);
        });
    });

    describe("POST /api/request_devices", () => {
        it("debería crear un request device si los datos son correctos", async () => {
            const newDevice = { request_id: 1, deviceName: "Tablet", quantity: 3 };
            (requestDeviceService.createRequestDevice as jest.Mock).mockResolvedValue(newDevice);

            const response = await request(app).post("/api/request_devices").send(newDevice);
            expect(response.status).toBe(201);
            expect(response.body).toEqual({ msg: "Request device created", requestDevice: newDevice });
        });

        it("debería devolver error si falta algún campo", async () => {
            const newDevice = { deviceName: "Tablet", quantity: 3 };
            (requestDeviceService.createRequestDevice as jest.Mock).mockRejectedValue(new Error("Request id is required"));

            const response = await request(app).post("/api/request_devices").send(newDevice);
            expect(response.status).toBe(400);
            expect(response.body).toEqual({
                msg: expect.arrayContaining([
                  expect.objectContaining({
                    code: "invalid_type",
                    message: "Request id is required",
                    path: ["request_id"],
                  }),
                ]),
              });
        });
    });

    describe("PUT /api/request_devices/:id", () => {
        it("debería actualizar un request device si existe", async () => {
            const updatedDevice = { request_id: 1, deviceName: "Monitor", quantity: 5 };
            (requestDeviceService.updateRequestDevice as jest.Mock).mockResolvedValue(updatedDevice);

            const response = await request(app).put("/api/request_devices/1").send(updatedDevice);
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ msg: "Request device updated" });
        });

        it("debería devolver error si el request device no existe", async () => {
            (requestDeviceService.updateRequestDevice as jest.Mock).mockRejectedValue(new Error("RequestDevice with id 99 not found"));

            const response = await request(app).put("/api/request_devices/99").send({ quantity: 10 });
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ msg: "RequestDevice with id 99 not found" });
        });
    });

    describe("DELETE /api/request_devices/:id", () => {
        it("debería eliminar un request device si existe", async () => {
            (requestDeviceService.deleteRequestDevice as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete("/api/request_devices/1");
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ msg: "Request device deleted" });
        });

        it("debería devolver error si el request device no existe", async () => {
            (requestDeviceService.deleteRequestDevice as jest.Mock).mockRejectedValue(new Error("RequestDevice with id 99 not found"));

            const response = await request(app).delete("/api/request_devices/99");
            expect(response.status).toBe(404);
            expect(response.body).toEqual({ msg: "RequestDevice with id 99 not found" });
        });
    });

    describe("DELETE /api/request_devices", () => {
        it("debería eliminar todos los request devices", async () => {
            (requestDeviceService.deleteAllRequest as jest.Mock).mockResolvedValue(true);

            const response = await request(app).delete("/api/request_devices");
            expect(response.status).toBe(200);
            expect(response.body).toEqual({ msg: "All request deleted" });
        });

    });
});
