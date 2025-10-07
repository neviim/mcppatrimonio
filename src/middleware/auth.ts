import type { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { env } from "../config/env.js";
import crypto from "crypto";

/**
 * Interface para Request com informações de autenticação
 */
export interface AuthenticatedRequest extends Request {
  authenticated?: boolean;
  apiKeyId?: string;
}

/**
 * Middleware de autenticação baseado em API Key
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  // Se não houver API keys configuradas, permite acesso (modo desenvolvimento)
  if (!env.API_KEYS || env.API_KEYS.length === 0) {
    logger.warn("No API keys configured - authentication disabled");
    req.authenticated = true;
    next();
    return;
  }

  // Obtém o token do header Authorization
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    logger.warn("Missing Authorization header", {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({
      error: "Unauthorized",
      message: "Missing Authorization header",
    });
    return;
  }

  // Valida formato "Bearer <token>"
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    logger.warn("Invalid Authorization header format", {
      ip: req.ip,
      path: req.path,
    });
    res.status(401).json({
      error: "Unauthorized",
      message: "Invalid Authorization header format. Expected: Bearer <token>",
    });
    return;
  }

  const token = parts[1];

  // Valida o token contra as API keys configuradas
  const validKey = env.API_KEYS.find((key) => {
    return crypto.timingSafeEqual(
      Buffer.from(key),
      Buffer.from(token.padEnd(key.length))
    );
  });

  if (!validKey) {
    logger.warn("Invalid API key", {
      ip: req.ip,
      path: req.path,
      tokenPrefix: token.substring(0, 8),
    });
    res.status(403).json({
      error: "Forbidden",
      message: "Invalid API key",
    });
    return;
  }

  // Autenticação bem-sucedida
  req.authenticated = true;
  req.apiKeyId = crypto.createHash("sha256").update(validKey).digest("hex").substring(0, 16);

  logger.debug("Request authenticated", {
    ip: req.ip,
    path: req.path,
    keyId: req.apiKeyId,
  });

  next();
}

/**
 * Middleware opcional que permite requests sem autenticação
 * mas adiciona informações de autenticação se presente
 */
export function optionalAuthMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !env.API_KEYS || env.API_KEYS.length === 0) {
    req.authenticated = false;
    next();
    return;
  }

  // Tenta autenticar, mas não bloqueia se falhar
  const parts = authHeader.split(" ");
  if (parts.length === 2 && parts[0] === "Bearer") {
    const token = parts[1];
    const validKey = env.API_KEYS.find((key) => {
      try {
        return crypto.timingSafeEqual(
          Buffer.from(key),
          Buffer.from(token.padEnd(key.length))
        );
      } catch {
        return false;
      }
    });

    if (validKey) {
      req.authenticated = true;
      req.apiKeyId = crypto.createHash("sha256").update(validKey).digest("hex").substring(0, 16);
    }
  }

  next();
}
