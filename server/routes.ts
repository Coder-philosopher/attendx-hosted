import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEventSchema, insertTokenClaimSchema } from "@shared/schema";
import { z } from "zod";

// Helper function for validation errors
function formatZodError(error: z.ZodError) {
  return {
    message: "Validation failed",
    errors: error.errors.map(err => ({
      path: err.path.join('.'),
      message: err.message
    }))
  };
}

export async function registerRoutes(app: Express): Promise<Server> {
  // API Routes
  const apiRouter = app.route('/api');

  // GET all events
  app.get('/api/events', async (req: Request, res: Response) => {
    try {
      const events = await storage.getEvents();
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // GET event by ID
  app.get('/api/events/:id', async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      
      // Try to handle both numeric IDs (for memory storage) and string IDs (for MongoDB)
      let eventId: number | string = id;
      
      // If MongoDB is being used, use the ID as is (it's a string)
      // Otherwise, try to parse it as a number for memory storage
      if (!process.env.MONGODB_URI) {
        const numericId = parseInt(id);
        if (isNaN(numericId)) {
          return res.status(400).json({ message: "Invalid event ID" });
        }
        eventId = numericId;
      }

      const event = await storage.getEvent(eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });

  // POST new event
  app.post('/api/events', async (req: Request, res: Response) => {
    try {
      const validatedData = insertEventSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json(formatZodError(validatedData.error));
      }

      const event = await storage.createEvent(validatedData.data);
      res.status(201).json(event);
    } catch (error) {
      res.status(500).json({ message: "Failed to create event" });
    }
  });

  // GET events by creator address
  app.get('/api/creators/:address/events', async (req: Request, res: Response) => {
    try {
      const address = req.params.address;
      const events = await storage.getEventsByCreator(address);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });

  // POST claim token
  app.post('/api/claims', async (req: Request, res: Response) => {
    try {
      const validatedData = insertTokenClaimSchema.safeParse(req.body);
      
      if (!validatedData.success) {
        return res.status(400).json(formatZodError(validatedData.error));
      }

      // Check if the event exists
      const event = await storage.getEvent(validatedData.data.eventId);
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Check if the wallet has already claimed a token for this event
      const hasAlreadyClaimed = await storage.hasWalletClaimedToken(
        validatedData.data.eventId,
        validatedData.data.walletAddress
      );

      if (hasAlreadyClaimed) {
        return res.status(409).json({ message: "Token already claimed by this wallet" });
      }

      // Check if the event has a max attendee limit and if it's reached
      if (event.maxAttendees) {
        const claimsCount = (await storage.getTokenClaimsByEvent(event.id)).length;
        if (claimsCount >= event.maxAttendees) {
          return res.status(409).json({ message: "Maximum number of attendees reached" });
        }
      }

      const claim = await storage.createTokenClaim(validatedData.data);
      res.status(201).json(claim);
    } catch (error) {
      res.status(500).json({ message: "Failed to record token claim" });
    }
  });

  // GET claims by wallet address
  app.get('/api/wallets/:address/claims', async (req: Request, res: Response) => {
    try {
      const address = req.params.address;
      const claims = await storage.getTokenClaimsByWallet(address);
      
      // Fetch the associated events for each claim
      const claimsWithEvents = await Promise.all(
        claims.map(async (claim) => {
          const event = await storage.getEvent(claim.eventId);
          return {
            ...claim,
            event
          };
        })
      );
      
      res.json(claimsWithEvents);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch token claims" });
    }
  });

  // GET check if wallet has claimed token for event
  app.get('/api/events/:eventId/claims/:walletAddress', async (req: Request, res: Response) => {
    try {
      const eventId = req.params.eventId;
      
      // Handle different storage types (MongoDB uses string IDs, memory storage uses numeric IDs)
      let parsedEventId: number | string = eventId;
      if (!process.env.MONGODB_URI) {
        // For memory storage, convert to number
        const numericId = parseInt(eventId);
        if (isNaN(numericId)) {
          return res.status(400).json({ message: "Invalid event ID" });
        }
        parsedEventId = numericId;
      }

      const walletAddress = req.params.walletAddress;
      const hasClaimed = await storage.hasWalletClaimedToken(parsedEventId, walletAddress);
      
      res.json({ hasClaimed });
    } catch (error) {
      console.error("Error checking claim status:", error);
      res.status(500).json({ message: "Failed to check claim status" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
