import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertClientSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/clients", async (_req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.post("/api/clients", async (req, res) => {
    const result = insertClientSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Dados inválidos" });
    }
    
    const client = await storage.createClient(result.data);
    res.json(client);
  });

  app.patch("/api/clients/:id", async (req, res) => {
    const result = insertClientSchema.safeParse(req.body);
    if (!result.success) {
      return res.status(400).json({ message: "Dados inválidos" });
    }

    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    const updatedClient = await storage.updateClient(id, result.data);
    res.json(updatedClient);
  });

  app.delete("/api/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Cliente não encontrado" });
    }

    await storage.deleteClient(id);
    res.status(204).end();
  });

  const httpServer = createServer(app);
  return httpServer;
}
