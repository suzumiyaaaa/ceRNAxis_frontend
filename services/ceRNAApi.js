import { apiClient } from '@/lib/apiConfig' // 导入配置好的API客户端

/**
 * Transform backend network topology data to frontend format for NetworkTopologyGraph
 * @param {Object} backendData - Raw data from /api/network/topology
 * @returns {Object} Formatted data { nodes: [], links: [] }
 *
 * 功能：将后端网络拓扑数据转换为前端 NetworkTopologyGraph 组件所需的格式
 * 输入：后端原始数据对象
 * 输出：包含 nodes 和 links 数组的对象
 */
const transformNetworkTopologyData = (backendData) => {
  // Backend data structure expected:
  // {
  //   nodes: [
  //     { id: string, type: 'lncRNA'|'circRNA'|'miRNA'|'mRNA', name: string, expression: number }
  //   ],
  //   edges: [
  //     { source: string, target: string, type: 'sponge'|'target', strength: number }
  //   ]
  // }

  // 如果后端使用不同的字段名，在这里进行映射转换
  // 处理节点数据：映射字段名，确保前端使用统一的字段名
  const nodes = (backendData.nodes || []).map(node => ({
    id: node.id || node.node_id, // ID字段映射
    type: node.type || node.node_type, // 节点类型字段映射
    name: node.name || node.gene_symbol || node.id, // 名称字段映射，使用基因符号或ID作为备选
    expression: parseFloat(node.expression || node.expression_level || 0) // 表达量字段映射并转换为浮点数
  }))

  // 处理边数据：映射字段名，确保前端使用统一的字段名
  const links = (backendData.edges || backendData.links || []).map(edge => ({
    source: edge.source || edge.source_id, // 源节点ID字段映射
    target: edge.target || edge.target_id, // 目标节点ID字段映射
    type: edge.type || edge.interaction_type, // 交互类型字段映射
    strength: parseFloat(edge.strength || edge.weight || 0.5) // 强度字段映射并转换为浮点数，默认0.5
  }))

  return { nodes, links }
}

/**
 * Transform backend correlation network data to frontend format for NodeRelationshipGraph
 * @param {Object} backendData - Raw data from /api/network/correlation
 * @returns {Object} Formatted data { nodes: [], links: [] }
 *
 * 功能：将后端基因相关性网络数据转换为前端 NodeRelationshipGraph 组件所需的格式
 * 输入：后端原始数据对象
 * 输出：包含 nodes 和 links 数组的对象
 */
const transformCorrelationNetworkData = (backendData) => {
  // Backend data structure expected:
  // {
  //   nodes: [
  //     { id: string, name: string, type: string, expression: number }
  //   ],
  //   edges: [
  //     { source: string, target: string, correlation: number, strength: number, type: 'positive'|'negative' }
  //   ]
  // }

  // 处理节点数据：映射字段名，确保前端使用统一的字段名
  const nodes = (backendData.nodes || []).map(node => ({
    id: node.id || node.gene_id, // ID字段映射，支持 gene_id 作为备选
    name: node.name || node.gene_symbol || node.id, // 名称字段映射，使用基因符号或ID作为备选
    type: node.type || node.gene_type || 'unknown', // 节点类型字段映射，默认为 'unknown'
    expression: parseFloat(node.expression || node.expression_level || 0) // 表达量字段映射并转换为浮点数
  }))

  // 处理边数据：计算相关性强度和类型
  const links = (backendData.edges || backendData.links || []).map(edge => {
    // 获取相关性系数，支持 correlation 和 corr_coefficient 字段名
    const correlation = parseFloat(edge.correlation || edge.corr_coefficient || 0)
    return {
      source: edge.source || edge.source_id, // 源节点ID字段映射
      target: edge.target || edge.target_id, // 目标节点ID字段映射
      correlation: correlation, // 相关性系数
      strength: Math.abs(correlation), // 相关性强度为相关系数的绝对值
      type: correlation >= 0 ? 'positive' : 'negative' // 根据相关系数正负确定类型
    }
  })

  return { nodes, links }
}

/**
 * Transform backend expression heatmap data to frontend format for ExpressionHeatmap
 * @param {Object} backendData - Raw data from /api/expression/heatmap
 * @returns {Object} Formatted data { genes: [], samples: [], expressionData: [], minVal, maxVal }
 *
 * 功能：将后端基因表达热图数据转换为前端 ExpressionHeatmap 组件所需的格式
 * 输入：后端原始数据对象
 * 输出：包含基因列表、样本列表、表达数据数组及最小最大值的对象
 */
const transformExpressionHeatmapData = (backendData) => {
  // Backend data structure expected:
  // {
  //   genes: string[],
  //   samples: string[],
  //   expressionMatrix: number[][] | {gene: string, sample: string, value: number}[]
  // }

  const genes = backendData.genes || []
  const samples = backendData.samples || []

  let expressionData = []

  // 处理表达矩阵数据，支持多种后端数据格式
  if (Array.isArray(backendData.expressionMatrix)) {
    // 如果 expressionMatrix 是数组
    if (backendData.expressionMatrix.length > 0 && Array.isArray(backendData.expressionMatrix[0])) {
      // 情况1：二维数组格式 [基因][样本] 的矩阵
      // 遍历每个基因的行，再遍历每个样本的列
      backendData.expressionMatrix.forEach((row, geneIndex) => {
        row.forEach((value, sampleIndex) => {
          expressionData.push({
            gene: genes[geneIndex], // 使用基因索引获取基因名
            sample: samples[sampleIndex], // 使用样本索引获取样本名
            value: parseFloat(value) // 将表达值转换为浮点数
          })
        })
      })
    } else if (backendData.expressionMatrix.length > 0 && backendData.expressionMatrix[0].gene) {
      // 情况2：对象数组格式，每个对象包含基因、样本和值
      expressionData = backendData.expressionMatrix.map(item => ({
        gene: item.gene || item.gene_id, // 基因字段映射
        sample: item.sample || item.sample_id, // 样本字段映射
        value: parseFloat(item.value || item.expression) // 值字段映射并转换为浮点数
      }))
    }
  } else if (backendData.expressionData) {
    // 情况3：使用 alternative 字段名 expressionData
    expressionData = backendData.expressionData.map(item => ({
      gene: item.gene || item.gene_id, // 基因字段映射
      sample: item.sample || item.sample_id, // 样本字段映射
      value: parseFloat(item.value || item.expression) // 值字段映射并转换为浮点数
    }))
  }

  // 计算表达值的最小值和最大值，用于热图颜色映射
  const values = expressionData.map(d => d.value).filter(v => !isNaN(v)) // 提取所有值并过滤掉NaN
  const minVal = values.length > 0 ? Math.min(...values) : 0 // 最小值，如果无有效值则默认为0
  const maxVal = values.length > 0 ? Math.max(...values) : 1 // 最大值，如果无有效值则默认为1

  return {
    genes,
    samples,
    expressionData,
    minVal,
    maxVal
  }
}

/**
 * Fetch ceRNA network topology data
 * @param {Object} params - Query parameters
 * @param {string} params.species - Species filter (e.g., 'human', 'mouse')
 * @param {string} params.tissue - Tissue filter (e.g., 'liver', 'brain')
 * @param {string} params.dataset - Dataset identifier
 * @returns {Promise<Object>} Formatted network topology data
 *
 * 功能：获取ceRNA网络拓扑数据
 * 参数：查询参数对象，包括物种、组织、数据集等筛选条件
 * 返回：格式化后的网络拓扑数据，包含节点和边
 * 异常处理：如果API调用失败，回退到模拟数据
 */
export const fetchNetworkTopology = async (params = {}) => {
  try {
    // 调用API获取网络拓扑数据
    const response = await apiClient.get('/network/topology/', { params })

    // 后端响应结构通常为: { success: true, data: {...} } 或直接返回数据
    const backendData = response.data.data || response.data

    // 将后端数据转换为前端格式
    return transformNetworkTopologyData(backendData)
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error fetching network topology data:', error)

    // 开发环境下回退到模拟数据
    console.warn('Falling back to mock network topology data')
    return generateMockNetworkTopologyData()
  }
}

/**
 * Fetch gene correlation network data
 * @param {Object} params - Query parameters
 * @param {string} params.species - Species filter
 * @param {string} params.tissue - Tissue filter
 * @param {string} params.dataset - Dataset identifier
 * @param {number} params.minCorrelation - Minimum correlation threshold (absolute value)
 * @returns {Promise<Object>} Formatted correlation network data
 *
 * 功能：获取基因相关性网络数据
 * 参数：查询参数对象，包括物种、组织、数据集、最小相关性阈值等
 * 返回：格式化后的相关性网络数据，包含节点和边
 * 异常处理：如果API调用失败，回退到模拟数据
 */
export const fetchCorrelationNetwork = async (params = {}) => {
  try {
    // 调用API获取相关性网络数据
    const response = await apiClient.get('/network/correlation/', { params })

    // 后端响应结构通常为: { success: true, data: {...} } 或直接返回数据
    const backendData = response.data.data || response.data

    // 将后端数据转换为前端格式
    return transformCorrelationNetworkData(backendData)
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error fetching correlation network data:', error)

    // 开发环境下回退到模拟数据
    console.warn('Falling back to mock correlation network data')
    return generateMockCorrelationNetworkData()
  }
}

/**
 * Fetch gene expression heatmap data
 * @param {Object} params - Query parameters
 * @param {string} params.species - Species filter
 * @param {string} params.tissue - Tissue filter
 * @param {string} params.dataset - Dataset identifier
 * @param {string} params.geneSet - Gene set identifier (e.g., 'cancer', 'immune')
 * @returns {Promise<Object>} Formatted heatmap data
 *
 * 功能：获取基因表达热图数据
 * 参数：查询参数对象，包括物种、组织、数据集、基因集等筛选条件
 * 返回：格式化后的热图数据，包含基因列表、样本列表、表达数据数组
 * 异常处理：如果API调用失败，回退到模拟数据
 */
export const fetchExpressionHeatmap = async (params = {}) => {
  try {
    // 调用API获取表达热图数据
    const response = await apiClient.get('/expression/heatmap/', { params })

    // 后端响应结构通常为: { success: true, data: {...} } 或直接返回数据
    const backendData = response.data.data || response.data

    // 将后端数据转换为前端格式
    return transformExpressionHeatmapData(backendData)
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error fetching expression heatmap data:', error)

    // 开发环境下回退到模拟数据
    console.warn('Falling back to mock expression heatmap data')
    return generateMockExpressionHeatmapData()
  }
}

/**
 * Generate mock network topology data for development
 * @returns {Object} Mock network topology data
 *
 * 功能：生成模拟的网络拓扑数据用于开发测试
 * 返回：包含模拟节点和边的对象，模拟ceRNA网络中的各种RNA类型
 */
const generateMockNetworkTopologyData = () => {
  // 与 NetworkTopologyGraph.js 中的默认数据保持一致
  // 定义模拟节点数据：包含各种RNA类型的ceRNA网络节点
  const nodes = [
    { id: "lncRNA1", type: "lncRNA", name: "LINC00152", expression: 2.5 }, // 长链非编码RNA
    { id: "lncRNA2", type: "lncRNA", name: "MALAT1", expression: 3.2 }, // 长链非编码RNA
    { id: "lncRNA3", type: "lncRNA", name: "HOTAIR", expression: 1.8 }, // 长链非编码RNA
    { id: "circRNA1", type: "circRNA", name: "hsa_circ_0001946", expression: 4.1 }, // 环状RNA
    { id: "circRNA2", type: "circRNA", name: "hsa_circ_0001430", expression: 2.9 }, // 环状RNA
    { id: "miRNA1", type: "miRNA", name: "miR-21", expression: 5.0 }, // 微小RNA
    { id: "miRNA2", type: "miRNA", name: "miR-34a", expression: 3.7 }, // 微小RNA
    { id: "miRNA3", type: "miRNA", name: "miR-155", expression: 4.3 }, // 微小RNA
    { id: "mRNA1", type: "mRNA", name: "TP53", expression: 2.1 }, // 信使RNA
    { id: "mRNA2", type: "mRNA", name: "PTEN", expression: 3.5 }, // 信使RNA
    { id: "mRNA3", type: "mRNA", name: "MYC", expression: 4.8 }, // 信使RNA
    { id: "mRNA4", type: "mRNA", name: "EGFR", expression: 3.9 } // 信使RNA
  ]

  // 定义模拟边数据：模拟ceRNA网络中的调控关系
  const links = [
    { source: "lncRNA1", target: "miRNA1", type: "sponge", strength: 0.8 }, // lncRNA吸附miRNA
    { source: "lncRNA1", target: "miRNA2", type: "sponge", strength: 0.6 }, // lncRNA吸附miRNA
    { source: "lncRNA2", target: "miRNA1", type: "sponge", strength: 0.7 }, // lncRNA吸附miRNA
    { source: "lncRNA3", target: "miRNA3", type: "sponge", strength: 0.9 }, // lncRNA吸附miRNA
    { source: "circRNA1", target: "miRNA2", type: "sponge", strength: 0.5 }, // circRNA吸附miRNA
    { source: "circRNA2", target: "miRNA3", type: "sponge", strength: 0.7 }, // circRNA吸附miRNA
    { source: "miRNA1", target: "mRNA1", type: "target", strength: 0.9 }, // miRNA靶向mRNA
    { source: "miRNA1", target: "mRNA2", type: "target", strength: 0.8 }, // miRNA靶向mRNA
    { source: "miRNA2", target: "mRNA3", type: "target", strength: 0.7 }, // miRNA靶向mRNA
    { source: "miRNA3", target: "mRNA4", type: "target", strength: 0.6 }, // miRNA靶向mRNA
    { source: "miRNA3", target: "mRNA1", type: "target", strength: 0.5 } // miRNA靶向mRNA
  ]

  return { nodes, links }
}

/**
 * Generate mock correlation network data for development
 * @returns {Object} Mock correlation network data
 *
 * 功能：生成模拟的基因相关性网络数据用于开发测试
 * 返回：包含模拟节点和边的对象，模拟基因之间的相关性关系
 */
const generateMockCorrelationNetworkData = () => {
  // 与 NodeRelationshipGraph.js 中的默认数据保持一致
  // 定义模拟节点数据：包含各种基因功能类型
  const nodes = [
    { id: "TP53", name: "TP53", type: "tumor_suppressor", expression: 2.1 }, // 肿瘤抑制基因
    { id: "PTEN", name: "PTEN", type: "tumor_suppressor", expression: 3.5 }, // 肿瘤抑制基因
    { id: "MYC", name: "MYC", type: "oncogene", expression: 4.8 }, // 原癌基因
    { id: "EGFR", name: "EGFR", type: "oncogene", expression: 3.9 }, // 原癌基因
    { id: "KRAS", name: "KRAS", type: "oncogene", expression: 5.2 }, // 原癌基因
    { id: "BRCA1", name: "BRCA1", type: "dna_repair", expression: 2.8 }, // DNA修复基因
    { id: "BRCA2", name: "BRCA2", type: "dna_repair", expression: 2.5 }, // DNA修复基因
    { id: "AKT1", name: "AKT1", type: "signaling", expression: 3.7 }, // 信号通路基因
    { id: "PIK3CA", name: "PIK3CA", type: "signaling", expression: 4.1 }, // 信号通路基因
    { id: "VEGFA", name: "VEGFA", type: "angiogenesis", expression: 3.2 } // 血管生成基因
  ]

  // 生成随机相关性数据
  const links = []
  const possiblePairs = []

  // 生成所有可能的基因对组合（避免重复和自连接）
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      possiblePairs.push({ source: nodes[i].id, target: nodes[j].id })
    }
  }

  // 随机选择一些相关性连接
  const numLinks = Math.min(15, possiblePairs.length) // 最多选择15个连接
  const shuffled = possiblePairs.sort(() => 0.5 - Math.random()) // 随机打乱数组

  // 为选中的基因对生成随机相关性
  for (let i = 0; i < numLinks; i++) {
    const pair = shuffled[i]
    const correlation = (Math.random() * 1.8) - 0.9 // 生成 -0.9 到 0.9 的随机相关系数
    const strength = Math.abs(correlation) // 强度为相关系数的绝对值

    // 只添加显著的相关性（强度 > 0.2）
    if (strength > 0.2) {
      links.push({
        source: pair.source,
        target: pair.target,
        correlation: correlation,
        strength: strength,
        type: correlation > 0 ? "positive" : "negative" // 根据相关系数正负确定类型
      })
    }
  }

  return { nodes, links }
}

/**
 * Generate mock expression heatmap data for development
 * @returns {Object} Mock heatmap data
 *
 * 功能：生成模拟的基因表达热图数据用于开发测试
 * 返回：包含基因列表、样本列表、表达数据数组及最小最大值的对象
 * 数据特征：模拟正常组织、肿瘤组织和转移组织中的基因表达模式
 */
const generateMockExpressionHeatmapData = () => {
  // 与 ExpressionHeatmap.js 中的默认数据保持一致
  // 定义基因列表：常见癌症相关基因
  const genes = [
    "TP53", "PTEN", "MYC", "EGFR", "KRAS", "BRCA1", "BRCA2",
    "AKT1", "PIK3CA", "VEGFA", "CDK4", "CDK6", "RB1", "NF1",
    "MET", "ERBB2", "FGFR1", "PDGFRA", "KIT", "FLT3"
  ]

  // 定义样本列表：正常组织、肿瘤组织和转移组织样本
  const samples = [
    "Normal_1", "Normal_2", "Normal_3", // 正常组织样本
    "Tumor_1", "Tumor_2", "Tumor_3", "Tumor_4", "Tumor_5", // 肿瘤组织样本
    "Metastasis_1", "Metastasis_2", "Metastasis_3" // 转移组织样本
  ]

  // 生成表达数据
  const expressionData = []
  const minVal = -3, maxVal = 3 // 表达值范围限制

  // 遍历每个基因和每个样本，生成具有生物学意义的表达模式
  genes.forEach(gene => {
    samples.forEach(sample => {
      let value

      // 根据基因和样本类型生成有意义的表达模式
      if (sample.startsWith("Normal")) {
        // 正常组织：表达值在 -1 到 1 之间随机分布
        value = (Math.random() * 2) - 1 // -1 to 1
      } else if (sample.startsWith("Tumor")) {
        // 肿瘤组织：模拟特定基因在肿瘤中的异常表达
        if (["MYC", "EGFR", "KRAS"].includes(gene)) {
          // 这些基因在肿瘤中高表达
          value = 1 + Math.random() * 2 // 1 to 3
        } else if (["TP53", "PTEN"].includes(gene)) {
          // 这些肿瘤抑制基因在肿瘤中低表达
          value = -2 + Math.random() * 1 // -2 to -1
        } else {
          // 其他基因在肿瘤中正常波动
          value = (Math.random() * 4) - 2 // -2 to 2
        }
      } else { // Metastasis
        // 转移组织：模拟特定基因在转移中的异常表达
        if (["VEGFA", "MET", "ERBB2"].includes(gene)) {
          // 这些基因在转移中异常高表达
          value = 1.5 + Math.random() * 1.5 // 1.5 to 3
        } else {
          // 其他基因在转移中正常波动
          value = (Math.random() * 3) - 1.5 // -1.5 to 1.5
        }
      }

      // 添加一些随机噪声，使数据更真实
      value += (Math.random() - 0.5) * 0.5

      // 限制表达值在指定范围内
      value = Math.max(minVal, Math.min(maxVal, value))

      // 将数据添加到数组中，保留两位小数
      expressionData.push({
        gene,
        sample,
        value: parseFloat(value.toFixed(2))
      })
    })
  })

  // 计算实际的最小值和最大值
  const values = expressionData.map(d => d.value)
  const actualMinVal = Math.min(...values)
  const actualMaxVal = Math.max(...values)

  return {
    genes,
    samples,
    expressionData,
    minVal: actualMinVal,
    maxVal: actualMaxVal
  }
}

/**
 * Transform backend interaction data to Cytoscape.js format
 * @param {Object} backendData - Raw data from visualization endpoints
 * @returns {Array} Cytoscape elements array [{ data: { id, label, type, ... } }, ...]
 *
 * 功能：将后端交互数据转换为 Cytoscape.js 图库所需的格式
 * 输入：后端原始数据对象，包含 nodes 和 edges 数组
 * 输出：Cytoscape 元素数组，每个元素包含 data 对象
 * 处理逻辑：提取节点和边信息，转换为标准格式，添加唯一ID等
 */
const transformInteractionData = (backendData) => {
  const elements = []

  // 添加节点数据到Cytoscape元素数组
  if (backendData.nodes && Array.isArray(backendData.nodes)) {
    backendData.nodes.forEach(node => {
      elements.push({
        data: {
          id: node.id || node.node_id, // 节点ID字段映射
          label: node.name || node.node_name || node.id, // 节点标签字段映射
          type: node.type || node.node_type, // 节点类型字段映射
          ...node // 包含节点的其他属性
        }
      })
    })
  }

  // 添加边数据到Cytoscape元素数组
  if (backendData.edges && Array.isArray(backendData.edges)) {
    backendData.edges.forEach((edge, index) => {
      // 提取源节点和目标节点ID
      const source = edge.source || edge.source_id
      const target = edge.target || edge.target_id

      // 构建边数据对象
      const edgeData = {
        id: `edge_${source}_${target}_${index}_${Math.random().toString(36).substring(2, 8)}`, // 生成唯一边ID
        source: source, // 源节点ID
        target: target, // 目标节点ID
        species: edge.species, // 物种信息
        database: edge.database, // 数据库来源
        interactionType: edge.type || edge.interaction_type, // 交互类型字段映射
        regulateType: edge.regulate_type, // 调控类型
        ...edge // 包含边的其他属性
      }

      // 只有binding_score是有效数字时才添加bindingScore属性
      if (edge.binding_score != null && !isNaN(parseFloat(edge.binding_score))) {
        edgeData.bindingScore = parseFloat(edge.binding_score) // 结合分数转换为浮点数
      }

      // 将边数据添加到元素数组
      elements.push({
        data: edgeData
      })
    })
  }

  return elements
}

/**
 * Search nodes by ID/name
 * @param {Object} params - Query parameters
 * @param {string} params.search_key - Search keyword
 * @param {string} params.node_type - Optional node type filter (miRNA/mRNA/lncRNA/circRNA/pseudogene/other)
 * @returns {Promise<Array>} Array of matching nodes
 *
 * 功能：根据关键词和节点类型搜索节点
 * 参数：查询参数对象，包括搜索关键词和可选的节点类型筛选
 * 返回：匹配的节点数组
 * 异常处理：如果API调用失败，返回空数组
 */
export const searchNodes = async (params = {}) => {
  try {
    // 调用API搜索节点
    const response = await apiClient.get('/visualization/node-search/', { params })

    // 后端响应结构通常为: { code: 200, data: [...], msg: "success" }
    const backendData = response.data.data || response.data

    // 直接返回后端数据，不需要转换格式
    return backendData
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error searching nodes:', error)
    // 回退到空数组，避免前端报错
    return []
  }
}

/**
 * Fetch first-degree neighbors of a core node
 * @param {Object} params - Query parameters
 * @param {string} params.core_node - Core node ID
 * @param {string} params.species - Optional species filter
 * @param {string} params.database - Optional database filter
 * @param {string} params.type - Optional interaction type filter
 * @returns {Promise<Object>} Cytoscape elements array
 *
 * 功能：获取指定核心节点的一度邻居节点和边
 * 参数：查询参数对象，包括核心节点ID、物种、数据库、交互类型等筛选条件
 * 返回：Cytoscape 元素数组，包含节点和边
 * 处理逻辑：调用API获取数据，然后通过 transformInteractionData 转换为 Cytoscape 格式
 * 异常处理：如果API调用失败，返回空数组
 */
export const fetchFirstDegreeNeighbors = async (params = {}) => {
  try {
    // 调用API获取一度邻居数据
    const response = await apiClient.get('/visualization/first-degree-neighbors/', { params })

    // 提取后端数据
    const backendData = response.data.data || response.data

    // 转换为Cytoscape.js格式
    return transformInteractionData(backendData)
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error fetching first degree neighbors:', error)
    // 回退到空数组，避免前端报错
    return []
  }
}

/**
 * Expand node to show its unrendered neighbors
 * @param {Object} params - Query parameters
 * @param {string} params.expand_node - Node ID to expand
 * @param {Array} params.existing_nodes - Array of already rendered node IDs
 * @param {string} params.species - Optional species filter
 * @param {string} params.database - Optional database filter
 * @param {string} params.type - Optional interaction type filter
 * @returns {Promise<Object>} Cytoscape elements array (only new nodes and edges)
 *
 * 功能：扩展节点，显示其未渲染的邻居节点和边
 * 参数：查询参数对象，包括要扩展的节点ID、已渲染节点ID数组、筛选条件等
 * 返回：Cytoscape 元素数组，仅包含新节点和新边
 * 处理逻辑：将 existing_nodes 数组转换为JSON字符串，调用API，然后转换为 Cytoscape 格式
 * 异常处理：如果API调用失败，返回空数组
 */
export const expandNode = async (params = {}) => {
  try {
    // 确保 existing_nodes 参数被转换为JSON字符串，因为API可能需要字符串格式
    const requestParams = { ...params }
    if (requestParams.existing_nodes && Array.isArray(requestParams.existing_nodes)) {
      requestParams.existing_nodes = JSON.stringify(requestParams.existing_nodes)
    }

    // 调用API获取扩展节点数据
    const response = await apiClient.get('/visualization/expand-node/', { params: requestParams })

    // 提取后端数据
    const backendData = response.data.data || response.data

    // 转换为Cytoscape.js格式
    return transformInteractionData(backendData)
  } catch (error) {
    // API调用失败时打印错误信息
    console.error('Error expanding node:', error)
    // 回退到空数组，避免前端报错
    return []
  }
}

/**
 * Fetch multi-hop path search results between two RNA molecules
 * @param {Object} params - Query parameters
 * @param {string} params.source_name - Source RNA name
 * @param {string} params.target_name - Target RNA name
 * @param {number} params.max_hop - Maximum hop count (1-5, default 3)
 * @returns {Promise<Object>} Path search results { nodes, edges, paths, statistics }
 *
 * 功能：查询两个 RNA 分子之间的多级通路
 * 返回：包含节点、边、通路列表和统计信息的对象
 * 异常处理：如果API调用失败，返回空结果
 */
export const fetchPathSearch = async (params = {}) => {
  try {
    const response = await apiClient.post('/path-search/', {
      source_name: params.source_name,
      target_name: params.target_name,
      max_hop: params.max_hop || 3
    })

    const backendData = response.data.data || response.data

    return {
      nodes: backendData.nodes || [],
      edges: backendData.edges || [],
      paths: backendData.paths || [],
      statistics: backendData.statistics || { total_paths: 0, node_count: 0, edge_count: 0 },
      source_type: backendData.source_type || 'unknown',
      target_type: backendData.target_type || 'unknown'
    }
  } catch (error) {
    console.error('Error fetching path search:', error)
    return {
      nodes: [],
      edges: [],
      paths: [],
      statistics: { total_paths: 0, node_count: 0, edge_count: 0 },
      source_type: 'unknown',
      target_type: 'unknown'
    }
  }
}