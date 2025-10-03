import bcrypt from 'bcryptjs'

// 用户类型定义
export interface User {
  id: string
  name: string
  phone: string
  password?: string  // 不返回给前端
  role: 'admin' | 'employee'
  department?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

// 模拟数据库 - 生产环境应该使用真实数据库
const users: Map<string, User & { password: string }> = new Map()

// 初始化管理员账户
const initAdmin = async () => {
  const adminPassword = await bcrypt.hash('admin123456', 10)
  users.set('admin', {
    id: 'admin',
    name: '系统管理员',
    phone: '18888888888',
    password: adminPassword,
    role: 'admin',
    department: '管理部',
    createdAt: new Date(),
    isActive: true
  })

  // 添加一些测试员工账户
  const employeePassword = await bcrypt.hash('123456', 10)

  users.set('emp001', {
    id: 'emp001',
    name: '张三',
    phone: '13900000001',
    password: employeePassword,
    role: 'employee',
    department: '销售部',
    createdAt: new Date(),
    isActive: true
  })

  users.set('emp002', {
    id: 'emp002',
    name: '李四',
    phone: '13900000002',
    password: employeePassword,
    role: 'employee',
    department: '客服部',
    createdAt: new Date(),
    isActive: true
  })
}

// 初始化默认用户
initAdmin()

// 用户认证
export async function authenticateUser(phone: string, password: string): Promise<User | null> {
  // 通过手机号查找用户
  let foundUser = null
  for (const [, user] of users) {
    if (user.phone === phone) {
      foundUser = user
      break
    }
  }

  if (!foundUser || !foundUser.isActive) {
    return null
  }

  // 验证密码
  const isValid = await bcrypt.compare(password, foundUser.password)
  if (!isValid) {
    return null
  }

  // 更新最后登录时间
  foundUser.lastLogin = new Date()

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = foundUser
  return userWithoutPassword
}

// 创建新用户
export async function createUser(userData: {
  name: string
  phone: string
  password: string
  role: 'admin' | 'employee'
  department?: string
}): Promise<User> {
  // 检查手机号是否已存在
  for (const [, user] of users) {
    if (user.phone === userData.phone) {
      throw new Error('该手机号已被注册')
    }
  }

  // 生成用户ID
  const userId = `emp${String(users.size).padStart(3, '0')}`

  // 加密密码
  const hashedPassword = await bcrypt.hash(userData.password, 10)

  // 创建用户
  const newUser = {
    id: userId,
    name: userData.name,
    phone: userData.phone,
    password: hashedPassword,
    role: userData.role,
    department: userData.department,
    createdAt: new Date(),
    isActive: true
  }

  users.set(userId, newUser)

  // 返回用户信息（不包含密码）
  const { password: _, ...userWithoutPassword } = newUser
  return userWithoutPassword
}

// 获取所有用户（管理员功能）
export function getAllUsers(): User[] {
  const allUsers: User[] = []
  for (const [, user] of users) {
    const { password: _, ...userWithoutPassword } = user
    allUsers.push(userWithoutPassword)
  }
  return allUsers
}

// 更新用户状态
export function updateUserStatus(userId: string, isActive: boolean): boolean {
  const user = users.get(userId)
  if (!user) {
    return false
  }
  user.isActive = isActive
  return true
}

// 重置密码
export async function resetPassword(userId: string, newPassword: string): Promise<boolean> {
  const user = users.get(userId)
  if (!user) {
    return false
  }
  user.password = await bcrypt.hash(newPassword, 10)
  return true
}