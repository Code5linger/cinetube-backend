import { Role } from '../../generated/prisma/index.js';

export interface IChangeUserStatusPayload {
  userId: string;
  status: 'ACTIVE' | 'BLOCKED';
}

export interface IChangeUserRolePayload {
  userId: string;
  role: Role;
}
