import jwt from 'jsonwebtoken';


export type TokenState = 'valid' | 'expired' | 'invalid';
export function verifyJWT(token: string, secret: string): TokenState {
  try {
    jwt.verify(token, secret);
    return 'valid';
  } catch (error) {
    if (error.name == 'TokenExpiredError') {
      return 'expired';
    }
    return 'invalid';
  }
}
