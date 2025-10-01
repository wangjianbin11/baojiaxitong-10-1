import jwt from 'jsonwebtoken'
import { User } from './users'

// JWT密钥（生产环境应该使用环境变量）
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production'

// Token过期时间
const TOKEN_EXPIRY = '24h'  // 24小时

// 生成JWT Token
export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      phone: user.phone,
      name: user.name,
      role: user.role,
      department: user.department
    },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  )
}

// 验证JWT Token
export function verifyToken(token: string): User | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    return {
      id: decoded.id,
      phone: decoded.phone,
      name: decoded.name,
      role: decoded.role,
      department: decoded.department,
      createdAt: new Date(decoded.createdAt || Date.now()),
      isActive: true
    }
  } catch (error) {
    return null
  }
}

// 从请求头获取Token
export function getTokenFromHeaders(headers: Headers): string | null {
  const authorization = headers.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7)
  }
  return null
}