import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // 不需要认证的路径
  const publicPaths = ['/login', '/api/auth/login']

  // 检查是否是公开路径
  const isPublicPath = publicPaths.includes(path)

  // 从localStorage获取token通过headers传递（因为中间件无法访问localStorage）
  // 暂时禁用中间件检查，让客户端处理认证
  return NextResponse.next()

  // 如果是受保护的路径且没有token，重定向到登录页
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // 如果已登录访问登录页，重定向到首页
  if (isPublicPath && token && path === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// 配置需要中间件处理的路径
export const config = {
  matcher: [
    /*
     * 匹配所有请求路径除了以下开头的路径:
     * - _next/static (静态文件)
     * - _next/image (图片优化)
     * - favicon.ico (favicon文件)
     * - public (公共文件)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}