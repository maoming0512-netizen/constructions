'use client'

import { useEffect } from 'react'

/**
 * 抑制无害的控制台错误
 * - ERR_ABORTED: 请求被用户取消（快速切换页面）
 * - ClientFetchError: NextAuth 请求失败（离线或请求被取消）
 */
export function ErrorSuppressor() {
  useEffect(() => {
    const originalConsoleError = console.error
    
    console.error = (...args: any[]) => {
      const errorMessage = args[0]?.toString() || ''
      const errorStack = args[1]?.toString() || ''
      
      // 抑制无害的错误
      const shouldSuppress = 
        // 请求被中止（用户快速切换页面）
        errorMessage.includes('ERR_ABORTED') ||
        errorMessage.includes('net::ERR_ABORTED') ||
        // NextAuth 客户端获取错误
        errorMessage.includes('ClientFetchError') ||
        errorMessage.includes('Failed to fetch') && errorStack.includes('next-auth') ||
        // RSC 请求被取消
        errorStack.includes('_rsc=') && errorMessage.includes('ERR_ABORTED')
      
      if (!shouldSuppress) {
        originalConsoleError.apply(console, args)
      }
    }
    
    return () => {
      console.error = originalConsoleError
    }
  }, [])
  
  return null
}
