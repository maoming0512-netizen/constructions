'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Key, 
  Server, 
  Bot, 
  Save, 
  CheckCircle, 
  AlertCircle,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getAIConfig, setAIConfig, DEFAULT_AI_CONFIG } from '@/lib/ai'

const PRESETS = {
  deepseek: {
    name: 'DeepSeek',
    baseURL: 'https://api.deepseek.com',
    model: 'deepseek-v4-pro',
  },
  siliconflow: {
    name: 'SiliconFlow',
    baseURL: 'https://api.siliconflow.cn',
    model: 'deepseek-ai/DeepSeek-V4-Flash',
  },
  kimi: {
    name: 'Kimi (Moonshot)',
    baseURL: 'https://api.moonshot.cn/v1',
    model: 'kimi-k2.6',
  },
  openai: {
    name: 'OpenAI',
    baseURL: 'https://api.openai.com/v1',
    model: 'gpt-4',
  },
}

export default function SettingsPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAuth()
  
  // AI API 配置
  const [apiKey, setApiKey] = useState('')
  const [baseURL, setBaseURL] = useState('')
  const [model, setModel] = useState('')
  const [showApiKey, setShowApiKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)

  // 密码修改
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState(false)

  // 加载已有配置
  useEffect(() => {
    const config = getAIConfig()
    setApiKey(config.apiKey)
    setBaseURL(config.baseURL)
    setModel(config.model)
  }, [])

  // 如果未登录，重定向到登录页
  if (!isLoading && !isAuthenticated) {
    router.push('/auth/login')
    return null
  }

  // 保存 AI 配置
  const handleSaveAIConfig = () => {
    setAIConfig({
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: model.trim(),
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  // 测试连接
  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    try {
      const response = await fetch(baseURL.replace(/\/$/, '') + '/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      })
      if (response.ok) {
        setTestResult('success')
      } else {
        setTestResult('error')
      }
    } catch {
      setTestResult('error')
    } finally {
      setTesting(false)
    }
  }

  // 应用预设
  const applyPreset = (preset: keyof typeof PRESETS) => {
    const config = PRESETS[preset]
    setBaseURL(config.baseURL)
    setModel(config.model)
    setSaved(false)
  }

  // 修改密码
  const handleChangePassword = async () => {
    setPasswordError('')
    setPasswordSuccess(false)

    if (newPassword.length < 8) {
      setPasswordError('密码至少需要8位')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('两次输入的密码不一致')
      return
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      })

      if (response.ok) {
        setPasswordSuccess(true)
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
      } else {
        const data = await response.json()
        setPasswordError(data.error || '修改密码失败')
      }
    } catch {
      setPasswordError('网络错误，请重试')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[--lake-blue]" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6" style={{ background: 'var(--bg-color)' }}>
      <div className="max-w-3xl mx-auto">
        {/* 返回链接 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link 
            href="/profile" 
            className="inline-flex items-center gap-2 text-[--soft-gray] hover:text-[--deep-slate] transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            返回个人资料
          </Link>
        </motion.div>

        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-[--deep-slate]">账户设置</h1>
          <p className="text-[--soft-gray] mt-2">管理您的 AI API 配置和账户安全</p>
        </motion.div>

        <div className="space-y-6">
          {/* AI API 配置 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 className="text-xl font-semibold text-[--deep-slate] mb-6 flex items-center gap-2">
              <Bot className="w-5 h-5 text-[--lake-blue]" />
              AI API 配置
            </h2>

            {/* 快速预设 */}
            <div className="mb-6">
              <Label className="text-sm text-[--soft-gray] mb-3 block">快速选择服务商</Label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => applyPreset(key as keyof typeof PRESETS)}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    style={{
                      background: baseURL === preset.baseURL ? 'var(--lake-blue)' : 'var(--mist-gray)',
                      color: baseURL === preset.baseURL ? 'white' : 'var(--deep-slate)',
                    }}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {/* API Key */}
              <div>
                <Label htmlFor="apiKey" className="flex items-center gap-2">
                  <Key className="w-4 h-4" />
                  API Key
                </Label>
                <div className="relative mt-1.5">
                  <Input
                    id="apiKey"
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value)
                      setSaved(false)
                    }}
                    placeholder="sk-..."
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[--soft-gray] hover:text-[--deep-slate]"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-[--soft-gray] mt-1">
                  您的 API Key 只会存储在本地浏览器中，不会上传到服务器
                </p>
              </div>

              {/* Base URL */}
              <div>
                <Label htmlFor="baseURL" className="flex items-center gap-2">
                  <Server className="w-4 h-4" />
                  API 地址
                </Label>
                <Input
                  id="baseURL"
                  type="text"
                  value={baseURL}
                  onChange={(e) => {
                    setBaseURL(e.target.value)
                    setSaved(false)
                  }}
                  placeholder="https://api.example.com"
                  className="mt-1.5"
                />
              </div>

              {/* Model */}
              <div>
                <Label htmlFor="model">模型名称</Label>
                <Input
                  id="model"
                  type="text"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value)
                    setSaved(false)
                  }}
                  placeholder="gpt-4 / deepseek-v4-pro"
                  className="mt-1.5"
                />
              </div>

              {/* 操作按钮 */}
              <div className="flex flex-wrap gap-3 pt-2">
                <Button
                  onClick={handleSaveAIConfig}
                  style={{ background: 'var(--lake-blue)' }}
                  className="flex items-center gap-2"
                >
                  {saved ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      已保存
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      保存配置
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={testing || !apiKey}
                  className="flex items-center gap-2"
                >
                  {testing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      测试中...
                    </>
                  ) : (
                    <>
                      测试连接
                    </>
                  )}
                </Button>

                {testResult === 'success' && (
                  <span className="flex items-center gap-1 text-green-600 text-sm">
                    <CheckCircle className="w-4 h-4" />
                    连接成功
                  </span>
                )}
                {testResult === 'error' && (
                  <span className="flex items-center gap-1 text-red-500 text-sm">
                    <AlertCircle className="w-4 h-4" />
                    连接失败
                  </span>
                )}
              </div>
            </div>
          </motion.div>

          {/* 修改密码 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl p-6"
            style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--glass-border)',
            }}
          >
            <h2 className="text-xl font-semibold text-[--deep-slate] mb-6">修改密码</h2>

            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">当前密码</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="newPassword">新密码</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">确认新密码</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1.5"
                />
              </div>

              {passwordError && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {passwordError}
                </div>
              )}

              {passwordSuccess && (
                <div className="flex items-center gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  密码修改成功
                </div>
              )}

              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword}
                variant="outline"
              >
                修改密码
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
