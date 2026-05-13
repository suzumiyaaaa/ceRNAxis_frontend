import axios from 'axios'

/**
 * 统一API配置
 * 根据API代理规范，所有API调用都应以/api/cerna为前缀
 * 开发环境下通过Next.js代理解决跨域问题
 * 生产环境下使用环境变量配置的完整URL
 */

// 计算API基础URL
export const getApiBaseUrl = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL

  console.log(`[API Debug] NEXT_PUBLIC_API_URL env var: ${envUrl}`)

  if (!envUrl) {
    const defaultUrl = '/api/cerna'
    console.log(`[API Debug] No env var, using default: ${defaultUrl}`)
    return defaultUrl
  }

  // 确保URL以/api/cerna结尾
  if (envUrl.endsWith('/api/cerna')) {
    console.log(`[API Debug] Env var ends with /api/cerna, returning: ${envUrl}`)
    return envUrl
  }

  // 如果URL以/api结尾，添加/cerna
  if (envUrl.endsWith('/api')) {
    const result = `${envUrl}/cerna`
    console.log(`[API Debug] Env var ends with /api, adding /cerna: ${result}`)
    return result
  }

  // 否则直接返回（假设已经是完整URL）
  console.log(`[API Debug] Env var doesn't match patterns, returning as-is: ${envUrl}`)
  return envUrl
}

// 创建统一的axios实例
export const createApiClient = (baseURL = null) => {
  const apiBaseUrl = baseURL || getApiBaseUrl()

  console.log(`API Client base URL: ${apiBaseUrl}`)

  const instance = axios.create({
    baseURL: apiBaseUrl,
    timeout: 30000,
    maxRedirects: 0, // 禁用axios重定向，避免重定向循环
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // 请求拦截器：确保URL格式正确，避免重定向循环
  instance.interceptors.request.use(
    (config) => {
      if (config.url) {
        // 调试：记录原始URL
        console.log(`[API Debug] Original URL: ${config.url}, BaseURL: ${config.baseURL}`)

        // 确保URL以斜杠开头
        if (!config.url.startsWith('/')) {
          config.url = '/' + config.url
        }

        // 注释掉添加尾随斜杠的逻辑，由trailingSlash配置统一处理
        // 这避免了Django的APPEND_SLASH重定向
        // if (!config.url.includes('?') && !config.url.endsWith('/')) {
        //   config.url = config.url + '/'
        // }

        // if (config.url.includes('?')) {
        //   const [path, query] = config.url.split('?')
        //   if (!path.endsWith('/')) {
        //     config.url = path + '/?' + query
        //   }
        // }

        // 调试：记录最终URL
        console.log(`[API Debug] Final URL: ${config.url}, Full URL: ${config.baseURL}${config.url}`)
      }
      return config
    },
    (error) => {
      return Promise.reject(error)
    }
  )

  // 响应拦截器：处理错误
  instance.interceptors.response.use(
    (response) => {
      return response
    },
    async (error) => {
      // 直接返回错误，让上层处理
      return Promise.reject(error)
    }
  )

  return instance
}

// 默认API客户端
export const apiClient = createApiClient()

/**
 * 统一错误处理
 */
export const handleApiError = (error, context = 'API请求') => {
  console.error(`${context}错误:`, error)

  if (error.response) {
    // 服务器响应状态码不在2xx范围内
    console.error(`状态码: ${error.response.status}`)
    console.error(`响应数据:`, error.response.data)
    throw new Error(`${context}失败: ${error.response.status} ${error.response.data?.message || ''}`)
  } else if (error.request) {
    // 请求已发送但没有收到响应
    console.error('无响应:', error.request)
    throw new Error(`${context}失败: 网络错误或无响应`)
  } else {
    // 请求配置出错
    console.error('请求配置错误:', error.message)
    throw new Error(`${context}失败: ${error.message}`)
  }
}

/**
 * 统一响应处理
 * 处理后端返回的标准化响应结构 { code: 200, data: {...}, msg: "success" }
 */
export const handleApiResponse = (response, context = 'API响应') => {
  const responseData = response.data

  // 检查标准化响应结构
  if (responseData && typeof responseData === 'object') {
    // 如果有code字段，检查是否成功
    if (responseData.code !== undefined && responseData.code !== 200) {
      throw new Error(`${context}错误: ${responseData.msg || '未知错误'}`)
    }

    // 返回data字段，如果存在
    return responseData.data || responseData
  }

  return responseData
}

/**
 * 统一的GET请求封装
 */
export const apiGet = async (endpoint, params = {}, options = {}) => {
  try {
    const response = await apiClient.get(endpoint, { params, ...options })
    return handleApiResponse(response, `GET ${endpoint}`)
  } catch (error) {
    return handleApiError(error, `GET ${endpoint}`)
  }
}

/**
 * 统一的POST请求封装
 */
export const apiPost = async (endpoint, data = {}, options = {}) => {
  try {
    const response = await apiClient.post(endpoint, data, options)
    return handleApiResponse(response, `POST ${endpoint}`)
  } catch (error) {
    return handleApiError(error, `POST ${endpoint}`)
  }
}

export default {
  getApiBaseUrl,
  createApiClient,
  apiClient,
  handleApiError,
  handleApiResponse,
  apiGet,
  apiPost,
}