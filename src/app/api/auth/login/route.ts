import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/users'
import { generateToken } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, password } = body

    // 验证输入
    if (!phone || !password) {
      return NextResponse.json(
        { success: false, error: '请输入手机号和密码' },
        { status: 400 }
      )
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      return NextResponse.json(
        { success: false, error: '手机号格式不正确' },
        { status: 400 }
      )
    }

    // 认证用户
    const user = await authenticateUser(phone, password)
    if (!user) {
      return NextResponse.json(
        { success: false, error: '手机号或密码错误' },
        { status: 401 }
      )
    }

    // 生成Token
    const token = generateToken(user)

    // 返回用户信息和Token
    return NextResponse.json({
      success: true,
      data: {
        user,
        token
      }
    })

  } catch (error) {
    console.error('登录错误:', error)
    return NextResponse.json(
      { success: false, error: '登录失败，请重试' },
      { status: 500 }
    )
  }
}