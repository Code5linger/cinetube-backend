import type { RequestHandler } from 'express';
import { auth } from '../lib/auth.js';
import { prisma } from '../lib/prisma.js';
import { AccountStatus, Role } from '../generated/prisma/index.js';

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  accountStatus: true,
} as const;

export const optionalAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });
    if (session?.user) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: userSelect,
      });
      if (user && user.accountStatus !== AccountStatus.BLOCKED) {
        req.user = user;
      }
    }
  } catch {
    /* unauthenticated browse */
  }
  next();
};

export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: req.headers as Record<string, string>,
    });

    if (!session?.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: userSelect,
    });

    if (!user) {
      res.status(401).json({ message: 'User not found' });
      return;
    }

    if (user.accountStatus === AccountStatus.BLOCKED) {
      res.status(403).json({ message: 'Account suspended' });
      return;
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid session' });
  }
};

export const requireRole =
  (...roles: Role[]): RequestHandler =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Forbidden' });
      return;
    }
    next();
  };
