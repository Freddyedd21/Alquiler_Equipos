import request from "supertest";
import {app} from "../../src/app"; // Asegúrate de importar tu aplicación Express
import { contractDeviceService } from "../../src/services";
import { ContractDeviceSchema } from "../../src/schemas/contract_device.schema";

// Mock de los servicios
jest.mock("../services/contract_device.service");

describe("ContractDeviceController", () => {
    
    // Datos de prueba
    const mockContractDevice = {
        id_contract: 1,
        deviceName: "Laptop X",
        rented_quantity: 2,
        total_price: 1200.50,
        delivery_status: "Pending"
    };

    // GET - Obtener todos los dispositivos contratados
    it("GET /api/contract_devices debería devolver todos los contract devices", async () => {
        (contractDeviceService.getAllContractDevices as jest.Mock).mockResolvedValue([mockContractDevice]);

        const response = await request(app).get("/api/contract_devices");
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual([mockContractDevice]);
    });

    // GET - Obtener un dispositivo contratado por ID
    it("GET /api/contract_devices/:id debería devolver un contrato por ID", async () => {
        (contractDeviceService.getContractDeviceById as jest.Mock).mockResolvedValue(mockContractDevice);

        const response = await request(app).get("/api/contract_devices/1");
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(mockContractDevice);
    });

    it("GET /api/contract_devices/:id debería devolver error si el contrato no existe", async () => {
        (contractDeviceService.getContractDeviceById as jest.Mock).mockResolvedValue(null);

        const response = await request(app).get("/api/contract_devices/999");

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Contract device with id 999 not found" });
    });

    // POST - Crear un dispositivo contratado
    it("POST /api/contract_devices debería crear un nuevo contrato de dispositivo", async () => {
        (contractDeviceService.createContractDevice as jest.Mock).mockResolvedValue(mockContractDevice);

        const response = await request(app).post("/api/contract_devices").send(mockContractDevice);

        expect(response.status).toBe(201);
        expect(response.body).toEqual({ msg: "Contract device created", contractDevice: mockContractDevice });
    });

    it("POST /api/contract_devices debería devolver error si falta un campo", async () => {
        const invalidData = { ...mockContractDevice } as Partial<typeof mockContractDevice>;
        delete invalidData.deviceName;

        const response = await request(app).post("/api/contract_devices").send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty("msg");
    });

    // PUT - Actualizar un dispositivo contratado
    it("PUT /api/contract_devices/:id debería actualizar un contrato de dispositivo", async () => {
        (contractDeviceService.updateContractDevice as jest.Mock).mockResolvedValue(mockContractDevice);

        const response = await request(app).put("/api/contract_devices/1").send({ rented_quantity: 3 });

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: "Contract device updated" });
    });

    it("PUT /api/contract_devices/:id debería devolver error si el contrato no existe", async () => {
        (contractDeviceService.updateContractDevice as jest.Mock).mockImplementation(() => {
            throw new Error("Contract device with id 999 not found");
        });

        const response = await request(app).put("/api/contract_devices/999").send({ rented_quantity: 3 });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ msg: "Contract device with id 999 not found" });
    });

    // DELETE - Eliminar un dispositivo contratado
    it("DELETE /api/contract_devices/:id debería eliminar un contrato de dispositivo", async () => {
        (contractDeviceService.deleteContractDevice as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app).delete("/api/contract_devices/1");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: "Contract device deleted" });
    });


    // DELETE - Eliminar todos los dispositivos contratados
    it("DELETE /api/contract_devices debería eliminar todos los contract devices", async () => {
        (contractDeviceService.deleteAllContractDevice as jest.Mock).mockResolvedValue(undefined);

        const response = await request(app).delete("/api/contract_devices");

        expect(response.status).toBe(200);
        expect(response.body).toEqual({ msg: "All contractDevices deleted" });
    });
});
