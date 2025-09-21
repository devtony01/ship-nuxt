import { and, eq } from '@paracelsus/node-sql';
import { tokens } from '@ship-nuxt/entities';
import { TokenType } from '@ship-nuxt/enums';

import { securityUtil } from 'utils';

import database from 'db';

export type Token = typeof tokens.$inferSelect;

// Create the base service using the new @paracelsus/node-sql pattern
const service = database.createService<Token>(tokens, {
  useAutoIncrement: true,
});

interface CreateTokenOptions {
  userId: number;
  type: TokenType;
  expiresIn: number;
}

const createToken = async ({ userId, type, expiresIn }: CreateTokenOptions): Promise<string> => {
  const secureToken = await securityUtil.generateSecureToken();
  const value = await securityUtil.hashToken(secureToken);

  const now = new Date();
  const expiresOn = new Date(now.getTime() + expiresIn * 1000);

  const token = await service.insertOne({
    type,
    value,
    userId,
    expiresOn,
  });

  return `${token.id}.${secureToken}`;
};

const getToken = async (tokenId: number | undefined | null, type: TokenType) => {
  if (!tokenId) return null;

  const whereClause = and(eq(tokens.id, tokenId), eq(tokens.type, type));
  if (!whereClause) return null;

  const token = await service.findOne(whereClause);

  if (!token) return null;

  const now = new Date();

  if (token.expiresOn.getTime() <= now.getTime()) {
    const deleteClause = and(eq(tokens.id, tokenId), eq(tokens.type, type));
    if (deleteClause) {
      await service.deleteOne(deleteClause);
    }
    return null;
  }

  return token;
};

const validateToken = async (value: string | undefined | null, type: TokenType) => {
  if (!value) return null;

  const tokenParts = value.split('.');

  if (tokenParts.length !== 2) return null;

  const [tokenIdStr, secret] = tokenParts;
  const tokenId = Number.parseInt(tokenIdStr, 10);

  if (Number.isNaN(tokenId)) return null;

  const token = await getToken(tokenId, type);

  const isValid = await securityUtil.verifyTokenHash(token?.value, secret);

  if (!isValid || !token) return null;

  const now = new Date();

  if (token.expiresOn.getTime() <= now.getTime()) {
    const deleteClause = and(eq(tokens.id, tokenId), eq(tokens.type, type));
    if (deleteClause) {
      await service.deleteOne(deleteClause);
    }
    return null;
  }

  return token;
};

const invalidateToken = async (token?: string | null): Promise<void> => {
  if (!token) return;

  const tokenParts = token.split('.');

  if (tokenParts.length !== 2) return;

  const [tokenIdStr] = tokenParts;
  const tokenId = Number.parseInt(tokenIdStr, 10);

  if (Number.isNaN(tokenId)) return;

  const deleteClause = and(eq(tokens.id, tokenId), eq(tokens.type, TokenType.ACCESS));
  if (deleteClause) {
    await service.deleteOne(deleteClause);
  }
};

const invalidateUserTokens = async (userId: number, type: TokenType): Promise<void> => {
  const whereClause = and(eq(tokens.userId, userId), eq(tokens.type, type));
  if (whereClause) {
    await service.deleteMany(whereClause);
  }
};

const getUserActiveToken = async (userId: number, type: TokenType) => {
  const whereClause = and(eq(tokens.userId, userId), eq(tokens.type, type));
  if (!whereClause) return null;

  const token = await service.findOne(whereClause);

  if (!token) return null;

  const now = new Date();

  if (token.expiresOn.getTime() <= now.getTime()) {
    await service.deleteOne(eq(tokens.id, token.id));
    return null;
  }

  return token;
};

// Export enhanced service with custom methods
export default Object.assign(service, {
  createToken,
  validateToken,
  invalidateToken,
  invalidateUserTokens,
  getUserActiveToken,
});
