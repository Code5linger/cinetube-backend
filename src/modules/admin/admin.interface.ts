import { AccountStatus, Role } from '../../generated/prisma/index.js';

export interface IChangeUserStatusPayload {
  userId: string;
  status: AccountStatus;
}

export interface IChangeUserRolePayload {
  userId: string;
  role: Role;
}
