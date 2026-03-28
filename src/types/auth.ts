// import type { Role } from '@prisma/client';

import { Role } from '../generated/prisma/index.js';

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  name: string | null;
}
