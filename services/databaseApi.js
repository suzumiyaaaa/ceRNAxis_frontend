/**
 * ceRNAxis 数据库API服务
 * 提供ceRNA互作数据的查询、筛选、统计和导出功能
 */
import { apiClient } from '@/lib/apiConfig'

/**
 * Transform ceRNA interaction record from backend format to frontend format
 * According to API documentation, backend returns ceRNA interaction records
 * 将后端ceRNA互作记录转换为前端格式
 * @param {Object} record - Raw record from API 原始API记录
 * @returns {Object} Transformed record for frontend use 转换后的记录供前端使用
 */
const transformDatabaseRecord = (record) => {
  // Map backend ceRNA fields to frontend format 将后端ceRNA字段映射到前端格式
  return {
    id: record.id || record._id || Math.random().toString(36).substring(2, 11),
    mirna: record.mirna || record.miRNA || '',
    cerna: record.cerna || record.ceRNA || '',
    species: record.species || '',
    database: record.database || '',
    cerna_type: record.cerna_type || record.type || '',
    disease: record.disease || '',
    binding_score: record.binding_score !== undefined ? parseFloat(record.binding_score) : null,
    regulate_type: record.regulate_type || '',
    reference: record.reference || '',
    // Keep original fields for backward compatibility 保留原始字段以保持向后兼容性
    originalData: record,
  }
}

/**
 * Transform array of database records
 * 转换数据库记录数组
 * @param {Array} records - Array of raw records from API 原始API记录数组
 * @returns {Array} Transformed records 转换后的记录数组
 */
const transformDatabaseRecords = (records) => {
  if (!Array.isArray(records)) return []
  return records.map(transformDatabaseRecord)
}

/**
 * Generate mock ceRNA interaction data for development/testing
 * 生成模拟ceRNA互作数据用于开发/测试
 * @param {number} count - Number of mock records to generate 要生成的模拟记录数量
 * @returns {Array} Mock data array 模拟数据数组
 */
const generateMockDatabaseData = (count = 1000) => {
  // 模拟数据选项定义
  const mirnas = ['hsa-miR-21-5p', 'hsa-miR-34a-5p', 'hsa-miR-155-5p', 'hsa-miR-200c-3p', 'hsa-miR-146a-5p', 'hsa-miR-9-5p'];
  const cernas = ['TP53', 'PTEN', 'MYC', 'EGFR', 'KRAS', 'BRCA1', 'BRCA2', 'AKT1', 'PIK3CA', 'VEGFA'];
  const speciesList = ['Homo sapiens'];
  const databaseList = ['ENCORI', 'NPInter_4.0', 'miRTarBase_9.0', 'RNAInter', 'TargetSCAN_8.0', 'miRDB_6.0', 'miRWalk'];
  const typeList = ['miRNA-lncRNA', 'miRNA-mRNA'];
  const diseaseList = ['Cancer', 'Cardiovascular Disease', 'Neurodegenerative Disease', 'Autoimmune Disease', 'Metabolic Disease', ''];
  const regulateTypes = ['upregulation', 'downregulation', 'unknown'];

  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    mirna: mirnas[index % mirnas.length],
    cerna: cernas[index % cernas.length] + (index % 3 === 0 ? '-AS1' : ''),
    species: speciesList[index % speciesList.length],
    database: databaseList[index % databaseList.length],
    cerna_type: typeList[index % typeList.length],
    disease: diseaseList[index % diseaseList.length],
    binding_score: 50 + Math.random() * 50, // 50-100
    regulate_type: regulateTypes[index % regulateTypes.length],
    reference: `PMID:${1000000 + index}`,
    originalData: {}
  }))
}

/**
 * Apply search and filters to mock ceRNA data (simulates backend filtering)
 */
const filterMockData = (data, search, filters) => {
  let filteredData = [...data]

  // Apply search - search across all text fields 应用搜索 - 在所有文本字段中搜索
  if (search) {
    const query = search.toLowerCase()
    filteredData = filteredData.filter(item =>
      (item.mirna && item.mirna.toLowerCase().includes(query)) ||
      (item.cerna && item.cerna.toLowerCase().includes(query)) ||
      (item.species && item.species.toLowerCase().includes(query)) ||
      (item.database && item.database.toLowerCase().includes(query)) ||
      (item.cerna_type && item.cerna_type.toLowerCase().includes(query)) ||
      (item.disease && item.disease.toLowerCase().includes(query)) ||
      (item.regulate_type && item.regulate_type.toLowerCase().includes(query)) ||
      (item.reference && item.reference.toLowerCase().includes(query))
    )
  }

  // Apply filters 应用筛选器
  if (filters) {
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined && filters[key] !== '') {
        filteredData = filteredData.filter(item => {
          if (key === 'mirna') {
            return item.mirna && item.mirna.toLowerCase().includes(filters[key].toLowerCase())
          }
          if (key === 'cerna') {
            return item.cerna && item.cerna.toLowerCase().includes(filters[key].toLowerCase())
          }
          if (key === 'species') {
            return item.species === filters[key]
          }
          if (key === 'database') {
            return item.database === filters[key]
          }
          if (key === 'cerna_type') {
            return item.cerna_type === filters[key]
          }
          if (key === 'disease') {
            // 疾病字段可能为空字符串，表示未指定
            if (!filters[key] || filters[key] === '') {
              return true; // 如果筛选器为空，则不过滤
            }
            return item.disease && item.disease.toLowerCase().includes(filters[key].toLowerCase())
          }
          if (key === 'min_binding_score') {
            return item.binding_score >= filters[key]
          }
          if (key === 'max_binding_score') {
            return item.binding_score <= filters[key]
          }
          if (key === 'regulate_type') {
            return item.regulate_type === filters[key]
          }
          return true
        })
      }
    })
  }

  return filteredData
}

/**
 * Fetch ceRNA interaction records with search, filters, and pagination
 * 获取ceRNA互作记录，支持搜索、筛选和分页
 * @param {Object} params - Query parameters 查询参数
 * @param {string} params.search - Full-text search query 全文搜索查询
 * @param {Object} params.filters - Filter object 筛选器对象
 * @param {string} params.filters.mirna - miRNA name filter miRNA名称筛选
 * @param {string} params.filters.cerna - ceRNA name filter ceRNA名称筛选
 * @param {string} params.filters.species - Species filter 物种筛选
 * @param {string} params.filters.database - Database source filter 数据库来源筛选
 * @param {string} params.filters.cerna_type - ceRNA type filter ceRNA类型筛选
 * @param {string} params.filters.disease - Disease filter 疾病筛选
 * @param {number} params.filters.min_binding_score - Minimum binding score 最小结合分数
 * @param {number} params.filters.max_binding_score - Maximum binding score 最大结合分数
 * @param {string} params.filters.regulate_type - Regulation type filter 调控类型筛选
 * @param {number} params.page - Page number (1-based) 页码（从1开始）
 * @param {number} params.pageSize - Page size 页面大小
 * @returns {Promise<{data: Array, total: number, page: number, pageSize: number}>}
 */
export const fetchDatabaseRecords = async ({ search, filters, page, pageSize }) => {
  console.log('fetchDatabaseRecords called with:', { search, filters, page, pageSize })
  try {
    const params = {
      page: page || 1,
      pageSize: pageSize || 500,
    }

    // 顶部搜索框：使用search参数进行全文搜索
    if (search && search.trim() !== '') {
      params.search = search.trim()
    }

    // 筛选器参数
    if (filters) {
      // 文本字段筛选：miRNA和ceRNA
      if (filters.mirna && filters.mirna.trim() !== '') {
        params.mirna = filters.mirna.trim()
      }
      if (filters.cerna && filters.cerna.trim() !== '') {
        params.cerna = filters.cerna.trim()
      }

      // 分类字段筛选
      if (filters.species) params.species = filters.species
      // 处理多选：database和cerna_type可能是数组
      if (filters.database) {
        if (Array.isArray(filters.database) && filters.database.length > 0) {
          // 将数组用分号连接成字符串
          params.database = filters.database.join(';')
        } else if (typeof filters.database === 'string' && filters.database.trim() !== '') {
          params.database = filters.database
        }
      }
      if (filters.cerna_type) {
        if (Array.isArray(filters.cerna_type) && filters.cerna_type.length > 0) {
          params.cerna_type = filters.cerna_type.join(';')
        } else if (typeof filters.cerna_type === 'string' && filters.cerna_type.trim() !== '') {
          params.cerna_type = filters.cerna_type
        }
      }
      if (filters.disease) params.disease = filters.disease
      if (filters.regulate_type) params.regulate_type = filters.regulate_type

      // 数值范围筛选
      if (filters.min_binding_score !== null && filters.min_binding_score !== undefined) {
        params.min_binding_score = filters.min_binding_score
      }
      if (filters.max_binding_score !== null && filters.max_binding_score !== undefined) {
        params.max_binding_score = filters.max_binding_score
      }
    }

    console.log('Calling API with params:', params)
    const response = await apiClient.get('/cerna/query/', { params })
    console.log('API Response status:', response.status)

    // Debug: log the full response structure 调试：记录完整的响应结构
    console.log('API Response structure:', {
      responseData: response.data,
      responseDataType: typeof response.data,
      responseDataKeys: Object.keys(response.data || {}),
      nestedData: response.data.data,
      nestedDataType: typeof response.data.data,
      nestedDataKeys: response.data.data ? Object.keys(response.data.data) : []
    })

    // Backend response structure: {success: true, message: "查询成功", data: {...}} 后端响应结构
    // The data field contains {data: [...], total: ..., page: ..., pageSize: ...} data字段包含数据数组、总数、页码和页面大小
    const responseData = response.data.data || {}  // Get the data field from backend response 从后端响应获取data字段

    // Debug: log the data structure 调试：记录数据结构
    console.log('Response data structure:', {
      responseData,
      responseDataKeys: Object.keys(responseData),
      hasDataField: 'data' in responseData,
      dataFieldType: typeof responseData.data,
      dataFieldLength: Array.isArray(responseData.data) ? responseData.data.length : 'not array'
    })

    const rawData = responseData.data || []        // Actual data array 实际数据数组

    // Debug: log first record if available 调试：如果有记录则记录第一条
    if (rawData.length > 0) {
      console.log('First raw ceRNA record:', rawData[0])
    } else {
      console.warn('API returned empty data array for page', page, 'pageSize', pageSize)
      console.warn('Response structure:', {
        response: response.data,
        responseData,
        hasData: 'data' in responseData,
        dataLength: rawData.length
      })
    }

    const transformedData = transformDatabaseRecords(rawData)

    return {
      data: transformedData,
      total: responseData.total || 0,
      page: responseData.page || page,
      pageSize: responseData.pageSize || pageSize,
    }
  } catch (error) {
    console.error('Error fetching database records, falling back to mock data:', error)

    // Fallback to mock data for development/testing 回退到模拟数据用于开发/测试
    const mockData = generateMockDatabaseData(1000)
    const filteredData = filterMockData(mockData, search, filters)
    const total = filteredData.length

    // Pagination 分页
    const startIndex = (page - 1) * pageSize
    const paginatedData = filteredData.slice(startIndex, startIndex + pageSize)

    return {
      data: paginatedData,
      total,
      page,
      pageSize,
    }
  }
}

/**
 * Fetch database statistics
 * 获取数据库统计信息
 * @returns {Promise<{totalRecords: number, lastUpdated: string}>}
 */
export const fetchDatabaseStatistics = async () => {
  try {
    const response = await apiClient.get('/database/statistics/')
    const backendData = response.data.data || response.data

    return {
      totalRecords: backendData.total_records || backendData.totalRecords || 0,
      lastUpdated: backendData.last_updated || backendData.lastUpdated || new Date().toISOString().split('T')[0],
    }
  } catch (error) {
    console.warn('Statistics endpoint not available, falling back to mock statistics:', error)

    // Fallback to mock data if endpoint not available 如果端点不可用则回退到模拟数据
    return {
      totalRecords: 8008329,
      lastUpdated: new Date().toISOString().split('T')[0],
    }
  }
}

/**
 * Fetch filter options for ceRNA database
 * 获取ceRNA数据库筛选选项
 * @returns {Promise<{species: Array<string>, databases: Array<string>, cerna_types: Array<string>, diseases: Array<string>, regulate_types: Array<string>}>}
 */
export const fetchFilterOptions = async () => {
  try {
    const response = await apiClient.get('/database/filter-options/')
    const backendData = response.data.data || response.data

    const rawSpecies = backendData.species || []

    // 过滤掉包含分号的组合值（如'miRNA-mRNA;miRNA-lncRNA'）
    const rawCernaTypes = backendData.cerna_types || backendData.types || []
    const filteredCernaTypes = rawCernaTypes.filter(type => !type.includes(';'))

    return {
      species: rawSpecies.length > 0 ? rawSpecies : ['Homo sapiens'],
      databases: backendData.databases || ['ENCORI', 'NPInter_4.0', 'miRTarBase_9.0', 'RNAInter', 'TargetSCAN_8.0', 'miRDB_6.0', 'miRWalk'],
      cerna_types: filteredCernaTypes.length > 0 ? filteredCernaTypes : ['miRNA-lncRNA', 'miRNA-mRNA'],
      diseases: backendData.diseases || ['Cancer', 'Cardiovascular Disease', 'Neurodegenerative Disease', 'Autoimmune Disease', 'Metabolic Disease', ''],
      regulate_types: backendData.regulate_types || ['upregulation', 'downregulation', 'unknown'],
    }
  } catch (error) {
    console.warn('Filter options endpoint not available, falling back to default options:', error)

    // Fallback to default options 回退到默认选项
    return {
      species: ['Homo sapiens'],
      databases: ['ENCORI', 'NPInter_4.0', 'miRTarBase_9.0', 'RNAInter', 'TargetSCAN_8.0', 'miRDB_6.0', 'miRWalk'],
      cerna_types: ['miRNA-lncRNA', 'miRNA-mRNA'],
      diseases: ['Cancer', 'Cardiovascular Disease', 'Neurodegenerative Disease', 'Autoimmune Disease', 'Metabolic Disease', ''],
      regulate_types: ['upregulation', 'downregulation', 'unknown'],
    }
  }
}

/**
 * Export database records (optional)
 * 导出数据库记录（可选功能）
 * @param {Object} params - Query parameters (same as fetchDatabaseRecords) 查询参数（与fetchDatabaseRecords相同）
 * @param {string} params.format - Export format: 'csv', 'json', 'tsv' 导出格式：'csv', 'json', 'tsv'
 * @returns {Promise<Blob>} File blob for download 用于下载的文件Blob
 */
export const exportDatabaseRecords = async ({ search, filters, format = 'csv' }) => {
  try {
    const params = { format }

    if (search && search.trim() !== '') {
      const searchQuery = search.trim()
      params.search = searchQuery

      // Support multi-keyword search: split by spaces 支持多关键词搜索：按空格分割
      const keywords = searchQuery.split(/\s+/).filter(k => k.length > 0)
      if (keywords.length > 1) {
        params.searchKeywords = keywords.join(',')
        console.log('Multi-keyword search detected:', keywords)
      }
    }

    if (filters) {
      if (filters.mirna) params.mirna = filters.mirna
      if (filters.cerna) params.cerna = filters.cerna
      if (filters.species) params.species = filters.species
      // 处理多选：database和cerna_type可能是数组
      if (filters.database) {
        if (Array.isArray(filters.database) && filters.database.length > 0) {
          params.database = filters.database.join(';')
        } else if (typeof filters.database === 'string' && filters.database.trim() !== '') {
          params.database = filters.database
        }
      }
      if (filters.cerna_type) {
        if (Array.isArray(filters.cerna_type) && filters.cerna_type.length > 0) {
          params.cerna_type = filters.cerna_type.join(';')
        } else if (typeof filters.cerna_type === 'string' && filters.cerna_type.trim() !== '') {
          params.cerna_type = filters.cerna_type
        }
      }
      if (filters.disease) params.disease = filters.disease
      if (filters.regulate_type) params.regulate_type = filters.regulate_type
      if (filters.min_binding_score !== null && filters.min_binding_score !== undefined) {
        params.min_binding_score = filters.min_binding_score
      }
      if (filters.max_binding_score !== null && filters.max_binding_score !== undefined) {
        params.max_binding_score = filters.max_binding_score
      }
    }

    const response = await apiClient.get('/database/export/', {
      params,
      responseType: 'blob',
    })

    return response.data
  } catch (error) {
    console.error('Error exporting database records:', error)
    throw error
  }
}