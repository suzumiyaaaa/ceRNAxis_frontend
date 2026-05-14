/**
 * CeRNAInteractionGraph组件 - ceRNA相互作用网络图可视化组件
 * 基于Cytoscape.js构建交互式网络图，支持搜索、扩展节点等功能
 * 用于展示ceRNA-miRNA相互作用网络
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import cytoscape from 'cytoscape'
import CytoscapeComponent from 'react-cytoscapejs'  // Cytoscape.js React封装
import cytoscapeSvg from 'cytoscape-svg'
import { Box } from '@mui/system'                  // MUI系统样式组件
import { Card, Row, Col, Input, Button, Typography, Space, List, Tag, Spin, Alert } from 'antd'  // Ant Design UI组件
import { SearchOutlined, ExpandOutlined, ClearOutlined, FileImageOutlined, FileTextOutlined } from '@ant-design/icons'  // 图标
import { searchNodes, fetchFirstDegreeNeighbors, expandNode } from '@/services/ceRNAApi'  // API服务
import VisualizationContainer from '@/components/ui/container/VisualizationContainer'  // 可视化容器组件

cytoscape.use(cytoscapeSvg)

const { Text } = Typography  // Ant Design文本组件

/**
 * 节点类型颜色映射 - 定义不同节点类型的显示颜色
 * 遵循规范的颜色编码
 */
const NODE_TYPE_COLORS = {
  miRNA: '#3b82f6',      // 蓝色 - microRNA
  mRNA: '#10b981',       // 绿色 - 信使RNA
  lncRNA: '#ef4444',     // 红色 - 长链非编码RNA
  circRNA: '#8b5cf6',    // 紫色 - 环状RNA
  pseudogene: '#f59e0b', // 琥珀色 - 假基因
  ceRNA: '#f97316',      // 橙色 - 竞争性内源RNA
  other: '#6b7280'       // 灰色 - 其他类型
}

/**
 * 节点类型标签 - 定义节点类型的显示标签
 */
const NODE_TYPE_LABELS = {
  miRNA: 'miRNA',
  mRNA: 'mRNA',
  lncRNA: 'lncRNA',
  circRNA: 'circRNA',
  pseudogene: 'Pseudogene',
  ceRNA: 'ceRNA',
  other: 'Other'
}

/**
 * Cytoscape样式表 - 定义网络图的视觉样式
 * 包括节点样式、边样式和交互状态样式
 */
const cyStylesheet = [
  // Node styles
  {
    selector: 'node',
    style: {
      'background-color': '#6b7280', // Default gray color
      'label': 'data(label)',
      'width': 40,
      'height': 40,
      'font-size': '12px',
      'font-weight': 'bold',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-max-width': '80px',
      'text-wrap': 'wrap',
      'text-overflow-wrap': 'anywhere',
      'border-width': 2,
      'border-color': '#fff',
      'border-opacity': 1
    }
  },
  // Node type specific styles
  {
    selector: 'node[type = "miRNA"]',
    style: {
      'background-color': NODE_TYPE_COLORS.miRNA
    }
  },
  {
    selector: 'node[type = "mRNA"]',
    style: {
      'background-color': NODE_TYPE_COLORS.mRNA
    }
  },
  {
    selector: 'node[type = "lncRNA"]',
    style: {
      'background-color': NODE_TYPE_COLORS.lncRNA
    }
  },
  {
    selector: 'node[type = "circRNA"]',
    style: {
      'background-color': NODE_TYPE_COLORS.circRNA
    }
  },
  {
    selector: 'node[type = "pseudogene"]',
    style: {
      'background-color': NODE_TYPE_COLORS.pseudogene
    }
  },
  {
    selector: 'node[type = "ceRNA"]',
    style: {
      'background-color': NODE_TYPE_COLORS.ceRNA
    }
  },
  {
    selector: 'node[type = "other"]',
    style: {
      'background-color': NODE_TYPE_COLORS.other
    }
  },
  // Edge styles
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#9ca3af',
      'opacity': 0.7,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#9ca3af',
      'arrow-scale': 1
    }
  },
  // Selected node style
  {
    selector: 'node:selected',
    style: {
      'border-width': 4,
      'border-color': '#000'
    }
  }
]


/**
 * CeRNA相互作用网络图组件
 * 提供交互式网络图，支持节点搜索、过滤、扩展、删除等操作
 * 用于可视化ceRNA-miRNA相互作用网络
 *
 * @returns {JSX.Element} 网络图组件
 */
const CeRNAInteractionGraph = () => {
  // Refs - 引用对象
  const cyRef = useRef(null)            // Cytoscape实例引用
  const elementsHashRef = useRef('')    // 元素哈希值引用，用于检测元素变化
  const hasLaidOutRef = useRef(false)   // 是否已为当前实例应用布局
  const cyInstanceIdRef = useRef(0)     // Cytoscape实例ID，用于检测实例变化
  const isExpandingRef = useRef(false)  // 是否正在进行扩展操作
  const expandTimeoutRef = useRef(null) // 扩展操作超时引用，用于清理
  const isDeletingRef = useRef(false)   // 是否正在进行删除操作
  const deleteTimeoutRef = useRef(null) // 删除操作超时引用，用于清理

  // 搜索状态
  const [searchKey, setSearchKey] = useState('')                 // 搜索关键词

  // 数据和UI状态
  const [searchResults, setSearchResults] = useState([])         // 搜索结果列表
  const [selectedNodeId, setSelectedNodeId] = useState(null)     // 当前选中的节点ID
  const [cyElements, setCyElements] = useState([])               // Cytoscape图元素（节点和边）
  const [renderedNodes, setRenderedNodes] = useState([])         // 已渲染的节点ID列表
  const [loading, setLoading] = useState(false)                  // 加载状态
  const [error, setError] = useState(null)                       // 错误信息
  const [nodeCount, setNodeCount] = useState(0)                  // 当前节点数量
  const [edgeCount, setEdgeCount] = useState(0)                  // 当前边数量
  const [selectedNodeInfo, setSelectedNodeInfo] = useState(null) // 选中节点的详细信息
  const [hoveredEdgeInfo, setHoveredEdgeInfo] = useState(null)   // 悬停边的详细信息
  const [showNodeList, setShowNodeList] = useState(true)         // 是否显示节点列表侧边栏


  /**
   * 智能布局函数 - 根据节点数量选择最佳布局算法
   * @param {Object} cy - Cytoscape实例
   */
  const applySmartLayout = (cy) => {
    console.log('========== APPLYING SMART LAYOUT ==========')
    console.log('Cytoscape instance:', cy)
    console.log('Cytoscape instance ID:', cy._claudeInstanceId || 'unknown')
    console.log('Container dimensions:', cy.width(), 'x', cy.height())
    console.log('applySmartLayout - isExpandingRef:', isExpandingRef.current, 'isDeletingRef:', isDeletingRef.current)

    // 检查是否正在进行扩展或删除操作
    if (isExpandingRef.current || isDeletingRef.current) {
      console.log('Skipping layout in applySmartLayout during expand or delete operation')
      return
    }

    // 检查是否已经有布局在运行
    const hasRunningLayout = cy._private.layouts && cy._private.layouts.running
    if (hasRunningLayout) {
      console.log('Layout already running, skipping')
      return
    }

    // 检查节点数量
    const nodeCount = cy.nodes().length
    if (nodeCount === 0) {
      console.log('No nodes to layout, skipping')
      return
    }

    try {
      // 首先停止任何现有的布局
      cy.layout({ name: 'null' }).stop()
      console.log('Previous layouts stopped')

      const edgeCount = cy.edges().length
      console.log(`Node count: ${nodeCount}, Edge count: ${edgeCount}`)

      // 记录所有节点的当前位置（布局前）
      console.log('Node positions before layout:')
      cy.nodes().forEach((node, i) => {
        const pos = node.position()
        console.log(`  Node ${i}: id=${node.data('id')}, position=(${pos.x},${pos.y})`)
      })

      // 特殊处理：单个节点
      if (nodeCount === 1) {
        console.log('Single node detected, positioning at center')
        const singleNode = cy.nodes()[0]
        const centerX = cy.width() / 2
        const centerY = cy.height() / 2
        singleNode.position({ x: centerX, y: centerY })
        console.log(`Positioned node ${singleNode.data('id')} at (${centerX},${centerY})`)
        return // 不需要运行布局
      }

      let layout
      let layoutName = ''
      if (nodeCount <= 10) {
        // 对于少量节点，使用圆环布局
        layoutName = 'circle'
        const radius = Math.min(cy.width(), cy.height()) * 0.3
        layout = cy.layout({
          name: 'circle',
          fit: false,
          padding: 60,
          radius: radius,
          startAngle: 0,
          sweep: undefined,
          clockwise: true,
          sort: undefined,
          animate: true,
          animationDuration: 500,
          animationEasing: 'ease-out'
        })
        console.log(`Using ${layoutName} layout for small network (radius: ${radius})`)
      } else if (nodeCount <= 30) {
        // 对于中等数量节点，使用concentric布局
        layoutName = 'concentric'
        layout = cy.layout({
          name: 'concentric',
          fit: false,
          padding: 60,
          startAngle: 0,
          sweep: undefined,
          clockwise: true,
          equidistant: false,
          minNodeSpacing: 60,
          avoidOverlap: true,
          nodeDimensionsIncludeLabels: true,
          animate: true,
          animationDuration: 500,
          animationEasing: 'ease-out'
        })
        console.log(`Using ${layoutName} layout for medium network`)
      } else {
        // 对于大量节点，使用网格布局
        layoutName = 'grid'
        const rows = Math.ceil(Math.sqrt(nodeCount))
        const cols = Math.ceil(Math.sqrt(nodeCount))
        layout = cy.layout({
          name: 'grid',
          fit: false,
          padding: 80,
          avoidOverlap: true,
          avoidOverlapPadding: 50,
          nodeDimensionsIncludeLabels: true,
          animate: true,
          animationDuration: 500,
          animationEasing: 'ease-out',
          boundingBox: undefined,
          condense: false,
          rows: rows,
          cols: cols,
          position: undefined
        })
        console.log(`Using ${layoutName} layout for large network (${rows}x${cols})`)
      }

      // 添加布局完成监听器
      cy.one('layoutstop', (event) => {
        console.log(`========== ${layoutName.toUpperCase()} LAYOUT COMPLETED ==========`)
        console.log('Layout name:', event.layout.name)
        console.log('Node positions after layout:')
        cy.nodes().forEach((node, i) => {
          const pos = node.position()
          console.log(`  Node ${i}: id=${node.data('id')}, position=(${pos.x},${pos.y})`)
        })

        // 检查节点是否重叠
        checkNodeOverlap(cy)
      })

      layout.run()                       // 运行布局
      console.log(`${layoutName} layout started`)

      // 设置超时检查布局是否真的运行了
      setTimeout(() => {
        const runningLayouts = cy._private.layouts ? cy._private.layouts.running : null
        console.log(`Layout still running after 100ms: ${runningLayouts ? 'yes' : 'no'}`)
      }, 100)

    } catch (err) {
      console.error('Error applying smart layout:', err)
      console.error('Error stack:', err.stack)
      // 如果智能布局失败，回退到默认网格布局
      try {
        console.log('Trying fallback grid layout...')
        const fallbackLayout = cy.layout({
          name: 'grid',
          fit: false,
          padding: 80,
          avoidOverlap: true,
          avoidOverlapPadding: 40,
          nodeDimensionsIncludeLabels: true,
          animate: true,
          animationDuration: 500,
          animationEasing: 'ease-out'
        })
        fallbackLayout.run()
        console.log('Fallback grid layout applied')
      } catch (fallbackErr) {
        console.error('Error applying fallback layout:', fallbackErr)
      }
    }
  }

  /**
   * 检查节点是否重叠
   * @param {Object} cy - Cytoscape实例
   */
  const checkNodeOverlap = (cy) => {
    const nodes = cy.nodes()
    const nodeRadius = 25 // 假设节点半径
    const overlapThreshold = nodeRadius * 2 // 两个节点中心的距离小于这个值则认为重叠

    console.log('Checking node overlap...')

    let overlapCount = 0
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i]
        const node2 = nodes[j]
        const pos1 = node1.position()
        const pos2 = node2.position()

        const distance = Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2))

        if (distance < overlapThreshold) {
          overlapCount++
          console.warn(`Nodes overlapping: ${node1.data('id')} and ${node2.data('id')}, distance: ${distance.toFixed(2)}`)
        }
      }
    }

    if (overlapCount === 0) {
      console.log('No overlapping nodes detected')
    } else {
      console.warn(`Found ${overlapCount} overlapping node pairs`)
    }
  }

  /**
   * 初始化Cytoscape实例
   * 设置Cytoscape图实例，配置布局和事件监听器
   * @param {Object} cy - Cytoscape实例
   */
  const handleCyInit = useCallback((cy) => {
    console.log('Cytoscape initialized', cy)
    console.log('Container dimensions:', cy.container().offsetWidth, 'x', cy.container().offsetHeight)

    // 检查是否是同一个实例
    if (cyRef.current === cy) {
      console.log('Same Cytoscape instance, skipping re-initialization')
      return
    }

    // 分配新的实例ID
    cyInstanceIdRef.current += 1
    const instanceId = cyInstanceIdRef.current
    cy._claudeInstanceId = instanceId  // 将实例ID存储在cy对象上

    console.log(`New Cytoscape instance ID: ${instanceId}`)
    cyRef.current = cy

    // 重置布局标记，因为这是新实例
    hasLaidOutRef.current = false

    // Check initial state
    console.log('Initial nodes:', cy.nodes().length, 'edges:', cy.edges().length)


    // 停止任何正在运行的布局的函数
    const stopLayout = () => {
      console.log('stopLayout called')
      try {
        // 尝试停止任何正在运行的布局
        cy.layout({ name: 'null' }).stop()
        console.log('All layouts stopped')
      } catch (err) {
        console.warn('Error stopping layouts:', err)
      }
    }

    // 添加ready事件监听器 - Cytoscape准备好时触发
    cy.on('ready', () => {
      console.log('Cytoscape ready event fired')
      console.log('Ready - nodes:', cy.nodes().length, 'edges:', cy.edges().length)
      console.log('Container visible:', cy.container().offsetParent !== null)
      console.log('Container style:', cy.container().style)

      // 检查是否正在进行扩展或删除操作
      console.log('ready event - isExpandingRef:', isExpandingRef.current, 'isDeletingRef:', isDeletingRef.current)
      if (isExpandingRef.current || isDeletingRef.current) {
        console.log('Skipping layout in ready event during expand or delete operation')
        return
      }

      // 只在有节点时应用布局
      if (cy.nodes().length > 0) {
        console.log('Nodes present in ready event, applying smart layout')
        applySmartLayout(cy)
      } else {
        console.log('No nodes in ready event, skipping layout')
      }
    })

    // 事件监听器配置
    // 节点点击事件：选中节点并显示详细信息
    // 当用户点击节点时，选中节点、显示详细信息、停止布局动画并居中显示节点
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      const nodeData = node.data()
      setSelectedNodeId(nodeData.id)        // 设置选中的节点ID
      setSelectedNodeInfo(nodeData)         // 设置节点详细信息

      // 停止任何正在运行的布局（防止布局动画干扰）
      stopLayout()

      // 将视图中心定位到节点（无动画以避免移动）
      cy.center(node)
      console.log('Centered on node without animation')
    })

    // 边悬停事件：鼠标悬停在边上时显示边详细信息并高亮
    // 显示边详细信息，增加宽度和颜色以突出显示
    cy.on('mouseover', 'edge', (evt) => {
      const edge = evt.target
      setHoveredEdgeInfo(edge.data())
      // Highlight edge on hover
      edge.style({
        'opacity': 1,
        'width': 4,
        'line-color': '#1f2937'
      })
    })

    // 边离开悬停事件：鼠标离开边时恢复原始样式
    // 根据结合分数恢复边的宽度和颜色样式
    cy.on('mouseout', 'edge', (evt) => {
      const edge = evt.target
      setHoveredEdgeInfo(null)
      // Reset edge style based on binding score
      const bindingScore = edge.data('bindingScore')
      if (bindingScore != null) {
        const width = 1 + bindingScore * 4 // 1 to 5
        const color = bindingScore > 0.5 ? '#dc2626' : '#9ca3af'
        edge.style({
          'opacity': 0.7,
          'width': width,
          'line-color': color
        })
      } else {
        // Default style
        edge.style({
          'opacity': 0.7,
          'width': 2,
          'line-color': '#9ca3af'
        })
      }
    })

    // 节点悬停事件：鼠标悬停在节点上时增加边框宽度
    // 增加边框宽度和颜色以突出显示悬停节点
    cy.on('mouseover', 'node', (evt) => {
      const node = evt.target
      node.style({
        'border-width': 3,
        'border-color': '#374151'
      })
    })

    // 节点离开悬停事件：鼠标离开节点时恢复原始边框样式
    cy.on('mouseout', 'node', (evt) => {
      const node = evt.target
      node.style({
        'border-width': 2,
        'border-color': '#fff'
      })
    })

    // 边点击事件：点击边时显示边详细信息
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target
      setHoveredEdgeInfo(edge.data())
    })

    // 背景点击事件：点击网络图空白区域时取消选中节点
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        // Click on background: deselect
        setSelectedNodeId(null)
        setSelectedNodeInfo(null)
      }
    })
  }, [])

  /**
   * 搜索节点 - 根据关键词搜索节点
   * 调用API搜索节点并将结果显示在搜索结果列表中
   */
  const handleSearch = async () => {
    if (!searchKey.trim()) return

    setLoading(true)
    setError(null)
    try {
      const params = {
        search_key: searchKey.trim()
      }
      const results = await searchNodes(params)
      setSearchResults(results)
    } catch (err) {
      setError('Failed to search nodes: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 加载节点的一度邻居 - 获取指定节点的直接邻居节点和边
   * 用于构建初始网络图
   * @param {string} nodeId - 核心节点ID
   */
  const loadNodeNeighbors = async (nodeId) => {
    if (!nodeId) return

    console.log('========== LOADING NODE NEIGHBORS ==========')
    console.log('Node ID:', nodeId)
    console.log('Current time:', new Date().toISOString())
    console.log('Current renderedNodes:', renderedNodes.length)
    console.log('Current cyElements:', cyElements.length)

    setLoading(true)
    setError(null)
    try {
      const params = {
        core_node: nodeId
      }
      console.log('Fetching neighbors with params:', params)
      const elements = await fetchFirstDegreeNeighbors(params)
      console.log('Fetched elements count:', elements.length)
      const nodeCount = elements.filter(el => el.data.id && !el.data.source).length
      const edgeCount = elements.filter(el => el.data.source).length
      console.log('Nodes:', nodeCount, 'Edges:', edgeCount)
      console.log('First few elements:', elements.slice(0, 3))

      // Check node count limit (500)
      const newNodeCount = elements.filter(el => el.data.id && !el.data.source).length
      const totalNodes = renderedNodes.length + newNodeCount
      if (totalNodes > 500) {
        setError(`Node limit exceeded (${totalNodes} > 500). Please select a different node.`)
        return
      }

      // Update elements
      console.log('Setting cyElements with', elements.length, 'elements')
      setCyElements(elements)

      // Update rendered nodes list
      const nodeIds = elements
        .filter(el => el.data.id && !el.data.source)
        .map(el => el.data.id)
      console.log('Setting renderedNodes with', nodeIds.length, 'nodes:', nodeIds)
      setRenderedNodes(nodeIds)

      // Update counts
      console.log('Setting nodeCount:', nodeIds.length, 'edgeCount:', elements.filter(el => el.data.source).length)
      setNodeCount(nodeIds.length)
      setEdgeCount(elements.filter(el => el.data.source).length)

      // Select the core node
      console.log('Setting selectedNodeId:', nodeId)
      setSelectedNodeId(nodeId)

      // Clear search results
      console.log('Clearing search results')
      setSearchResults([])
    } catch (err) {
      setError('Failed to load node neighbors: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  /**
   * 扩展节点 - 显示指定节点未渲染的邻居节点和边
   * 将新节点以圆形布局添加到现有网络图中
   * @param {string} nodeId - 要扩展的节点ID
   */
  const handleExpandNode = async (nodeId) => {
    if (!nodeId) return

    // 设置扩展操作标志
    isExpandingRef.current = true
    console.log('Starting expand operation, setting isExpandingRef to true')

    setLoading(true)
    setError(null)
    try {
      const params = {
        expand_node: nodeId,
        existing_nodes: renderedNodes
      }
      const newElements = await expandNode(params)

      // Check node count limit
      const newNodeCount = newElements.filter(el => el.data.id && !el.data.source).length
      const totalNodes = renderedNodes.length + newNodeCount
      if (totalNodes > 500) {
        setError(`Node limit exceeded (${totalNodes} > 500). Cannot expand.`)
        return
      }

      // Filter out duplicate nodes and edges
      const filteredNewElements = newElements.filter(el => {
        if (el.data.id && !el.data.source) {
          // Node: check if already rendered
          return !renderedNodes.includes(el.data.id)
        } else if (el.data.source && el.data.target) {
          // Edge: check if edge with same source and target already exists
          // We'll check in the setCyElements callback to ensure we have latest state
          return true // Temporary, will filter in setCyElements
        }
        return true
      })

      // First, get existing edge keys from current cyElements
      const existingEdgeKeys = new Set()
      cyElements.forEach(el => {
        if (el.data.source && el.data.target) {
          existingEdgeKeys.add(`${el.data.source}_${el.data.target}`)
        }
      })

      // Filter out duplicate edges
      const elementsToAdd = filteredNewElements.filter(el => {
        if (el.data.source && el.data.target) {
          const edgeKey = `${el.data.source}_${el.data.target}`
          return !existingEdgeKeys.has(edgeKey)
        }
        return true
      })

      // Get parent node position for placing new nodes around it
      let parentPos = null
      if (cyRef.current) {
        const parentNode = cyRef.current.getElementById(nodeId)
        if (parentNode && parentNode.position()) {
          parentPos = parentNode.position()
        }
      }

      // Prepare elements with positions for new nodes
      const newNodes = elementsToAdd.filter(el => el.data.id && !el.data.source)
      const newEdges = elementsToAdd.filter(el => el.data.source)

      // Array to store node objects with positions
      const nodesWithPositions = []

      // Add new nodes with positions around parent node
      if (cyRef.current && newNodes.length > 0) {
        const radius = 150 // Distance from parent node
        const angleStep = (2 * Math.PI) / newNodes.length

        newNodes.forEach((node, index) => {
          let position = {}
          if (parentPos) {
            // Place new nodes in a circle around parent node
            const angle = index * angleStep
            position = {
              x: parentPos.x + radius * Math.cos(angle),
              y: parentPos.y + radius * Math.sin(angle)
            }
          } else {
            // If no parent position, use random position near center
            // Get canvas dimensions if available
            const width = cyRef.current.width() || 800
            const height = cyRef.current.height() || 600
            position = {
              x: width/2 + (Math.random() - 0.5) * 200,
              y: height/2 + (Math.random() - 0.5) * 200
            }
          }

          // Create node object with position
          const nodeWithPosition = {
            ...node,
            position: position
          }

          // Add node with position to Cytoscape
          const addedNode = cyRef.current.add(nodeWithPosition)

          // Store node with position for state update
          nodesWithPositions.push(nodeWithPosition)

          // Apply node color immediately
          const nodeType = node.data.type
          if (nodeType && NODE_TYPE_COLORS[nodeType]) {
            addedNode.style('background-color', NODE_TYPE_COLORS[nodeType])
          }
        })
      }

      // Add new edges to Cytoscape
      if (cyRef.current && newEdges.length > 0) {
        newEdges.forEach(edge => {
          const addedEdge = cyRef.current.add(edge)

          // Apply edge style immediately based on binding score
          const bindingScore = edge.data.bindingScore
          if (bindingScore != null && !isNaN(bindingScore)) {
            const width = 1 + bindingScore * 4 // 1 to 5
            const color = bindingScore > 0.5 ? '#dc2626' : '#9ca3af'
            addedEdge.style({
              'width': width,
              'line-color': color,
              'opacity': 0.7
            })
          }
        })
      }

      // Update state (cyElements should reflect the actual state in Cytoscape)
      console.log('About to setCyElements in expand operation')
      console.log('isExpandingRef.current before setCyElements:', isExpandingRef.current)
      console.log('nodesWithPositions count:', nodesWithPositions.length)
      console.log('newEdges count:', newEdges.length)

      setCyElements(prev => {
        const updatedExistingEdgeKeys = new Set()
        prev.forEach(el => {
          if (el.data.source && el.data.target) {
            updatedExistingEdgeKeys.add(`${el.data.source}_${el.data.target}`)
          }
        })

        // Filter out duplicate edges from elementsToAdd
        const filteredElementsToAdd = elementsToAdd.filter(el => {
          if (el.data.source && el.data.target) {
            const edgeKey = `${el.data.source}_${el.data.target}`
            return !updatedExistingEdgeKeys.has(edgeKey)
          }
          return true
        })

        // Use nodesWithPositions instead of original nodes from elementsToAdd
        const nodesFromElementsToAdd = filteredElementsToAdd.filter(el => el.data.id && !el.data.source)
        const edgesFromElementsToAdd = filteredElementsToAdd.filter(el => el.data.source)

        // Replace nodes with positioned nodes if available
        const finalElementsToAdd = [
          ...nodesWithPositions.length > 0 ? nodesWithPositions : nodesFromElementsToAdd,
          ...edgesFromElementsToAdd
        ]

        console.log('setCyElements callback - finalElementsToAdd count:', finalElementsToAdd.length)
        console.log('setCyElements callback - prev count:', prev.length)
        console.log('setCyElements callback - will return:', prev.length + finalElementsToAdd.length, 'elements')

        return [...prev, ...finalElementsToAdd]
      })

      // Update rendered nodes list
      const newNodeIds = nodesWithPositions.length > 0 ?
        nodesWithPositions.map(el => el.data.id) :
        newNodes.map(el => el.data.id)
      setRenderedNodes(prev => [...prev, ...newNodeIds])

      // Update counts
      setNodeCount(prev => prev + newNodeIds.length)
      setEdgeCount(prev => prev + newEdges.length)

    } catch (err) {
      setError('Failed to expand node: ' + err.message)
      console.error(err)
    } finally {
      // 清理之前的超时
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current)
      }
      // 延迟重置扩展操作标志，确保useEffect有足够时间检测到标志
      expandTimeoutRef.current = setTimeout(() => {
        console.log('Delayed: setting isExpandingRef to false')
        isExpandingRef.current = false
      }, 500) // 500ms延迟，确保React状态更新和useEffect执行完成
      setLoading(false)
    }
  }

  /**
   * 删除节点 - 从可视化中移除指定节点及其连接的边
   * 更新状态和计数，如果删除的是选中节点则清除选中状态
   * @param {string} nodeId - 要删除的节点ID
   */
  const handleDeleteNode = (nodeId) => {
    if (!nodeId) return

    // 设置删除操作标志
    isDeletingRef.current = true
    console.log('Starting delete operation, setting isDeletingRef to true')

    // 清理之前的超时
    if (deleteTimeoutRef.current) {
      clearTimeout(deleteTimeoutRef.current)
    }

    // First remove from Cytoscape instance
    let edgesDeleted = 0
    if (cyRef.current) {
      const node = cyRef.current.getElementById(nodeId)
      if (node) {
        // Get connected edges before removing the node
        const connectedEdges = node.connectedEdges()
        edgesDeleted = connectedEdges.length

        // Remove the node (this will also remove connected edges in Cytoscape)
        node.remove()
      }
    }

    // Update state to reflect the removal
    setCyElements(prev => {
      // Find the node to be deleted
      const nodeToDelete = prev.find(el => el.data.id === nodeId && !el.data.source)
      if (!nodeToDelete) return prev

      // Remove the node and all edges connected to it
      const newElements = prev.filter(el => {
        if (el.data.id === nodeId && !el.data.source) {
          // This is the node to delete
          return false
        }
        if (el.data.source === nodeId || el.data.target === nodeId) {
          // This is an edge connected to the node to delete
          return false
        }
        return true
      })

      return newElements
    })

    // Update rendered nodes list
    setRenderedNodes(prev => prev.filter(id => id !== nodeId))

    // Update counts
    setNodeCount(prev => prev - 1)
    setEdgeCount(prev => prev - edgesDeleted)

    // If the deleted node is currently selected, clear selection
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null)
      setSelectedNodeInfo(null)
    }

    console.log(`Deleted node: ${nodeId}, ${edgesDeleted} edges removed`)

    // 延迟重置删除操作标志，确保useEffect有足够时间检测到标志
    deleteTimeoutRef.current = setTimeout(() => {
      console.log('Delayed: setting isDeletingRef to false')
      isDeletingRef.current = false
    }, 300) // 300ms延迟，确保React状态更新和useEffect执行完成
  }

  /**
   * 重置画布 - 清空所有可视化元素和状态
   * 恢复到初始空状态
   */
  const handleReset = () => {
    setCyElements([])
    setRenderedNodes([])
    setSelectedNodeId(null)
    setSelectedNodeInfo(null)
    setHoveredEdgeInfo(null)
    setSearchResults([])
    setNodeCount(0)
    setEdgeCount(0)
    setError(null)
  }


  /**
   * 导出为PNG格式
   * 使用Cytoscape.js内置的png()方法将当前网络图导出为PNG图片并触发下载
   */
  const handleExportPNG = () => {
    if (!cyRef.current || cyRef.current.destroyed()) return
    try {
      const pngData = cyRef.current.png({
        output: 'blob',
        bg: '#ffffff',
        full: true
      })
      const url = URL.createObjectURL(pngData)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ceRNA_network.png'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export PNG:', err)
      setError('Failed to export PNG: ' + err.message)
    }
  }

  /**
   * 导出为SVG格式
   * 使用cytoscape-svg扩展的svg()方法将当前网络图导出为SVG文件并触发下载
   */
  const handleExportSVG = () => {
    if (!cyRef.current || cyRef.current.destroyed()) return
    const cy = cyRef.current

    // 保存并清除bypass styles（cy.svg()与bypass styles不兼容）
    const savedNodeStyles = []
    cy.nodes().forEach(node => {
      savedNodeStyles.push({ node, styles: { opacity: node.style('opacity') } })
      node.removeStyle()
    })
    const savedEdgeStyles = []
    cy.edges().forEach(edge => {
      savedEdgeStyles.push({ edge, styles: {
        'line-color': edge.style('line-color'),
        'target-arrow-color': edge.style('target-arrow-color'),
        'width': edge.style('width'),
        'opacity': edge.style('opacity')
      }})
      edge.removeStyle()
    })

    try {
      const svgString = cy.svg({ full: true, scale: 2 })
      const blob = new Blob([svgString], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'ceRNA_network.svg'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Failed to export SVG:', err)
      setError('Failed to export SVG: ' + err.message)
    }

    // 恢复bypass styles
    savedNodeStyles.forEach(({ node, styles }) => {
      if (styles.opacity !== undefined) node.style('opacity', styles.opacity)
    })
    savedEdgeStyles.forEach(({ edge, styles }) => {
      Object.entries(styles).forEach(([key, val]) => {
        if (val !== undefined) edge.style(key, val)
      })
    })
  }

  /**
   * 处理搜索结果点击 - 点击搜索结果中的节点时加载其邻居
   * @param {Object} node - 搜索结果节点对象
   */
  const handleSearchResultClick = (node) => {
    console.log('========== SEARCH RESULT CLICKED ==========')
    console.log('Clicked node:', node)
    console.log('Node ID:', node.node_id, 'Node name:', node.node_name, 'Node type:', node.node_type)
    loadNodeNeighbors(node.node_id)
  }

  /**
   * 处理扩展按钮点击 - 扩展当前选中的节点
   * 调用handleExpandNode函数
   */
  const handleExpandClick = () => {
    if (selectedNodeId) {
      handleExpandNode(selectedNodeId)
    }
  }

  /**
   * 副作用：元素变化时更新节点颜色和边样式
   * 当cyElements变化时，更新Cytoscape图中节点的颜色和边的样式
   * 根据元素变化比例决定是否应用布局（仅在大规模变化时应用）
   * 依赖项：cyElements - 当图元素发生变化时触发
   */
  useEffect(() => {
    console.log('cyElements changed:', cyElements.length, cyElements)
    console.log('isExpandingRef.current:', isExpandingRef.current)
    console.log('isDeletingRef.current:', isDeletingRef.current)
    console.log('expandTimeoutRef.current:', expandTimeoutRef.current)
    console.log('deleteTimeoutRef.current:', deleteTimeoutRef.current)

    // Calculate hash of elements to detect actual changes
    const elementsHash = JSON.stringify(cyElements.map(el => el.data.id || el.data.source))
    const elementsChanged = elementsHashRef.current !== elementsHash
    elementsHashRef.current = elementsHash

    if (cyRef.current && !cyRef.current.destroyed() && elementsChanged) {
      console.log('Cytoscape instance available, nodes:', cyRef.current.nodes().length, 'edges:', cyRef.current.edges().length)
      console.log('Container dimensions after update:', cyRef.current.container().offsetWidth, 'x', cyRef.current.container().offsetHeight)

      // Debug: log all node types
      cyRef.current.nodes().forEach((node, i) => {
        console.log(`Node ${i}: id=${node.data('id')}, type=${node.data('type')}, label=${node.data('label')}`)
      })

      // 检查是否正在进行扩展或删除操作
      console.log('isExpandingRef.current:', isExpandingRef.current, 'isDeletingRef.current:', isDeletingRef.current)
      if (isExpandingRef.current || isDeletingRef.current) {
        console.log('Skipping layout during expand or delete operation')
        return
      }

      // 简化布局逻辑：只要元素变化且有节点，就应用布局
      // 这确保节点不会重叠，无论变化大小
      const expectedNodeCount = cyElements.filter(el => el.data.id && !el.data.source).length
      const expectedEdgeCount = cyElements.filter(el => el.data.source).length
      const actualNodeCount = cyRef.current.nodes().length
      const actualEdgeCount = cyRef.current.edges().length

      console.log(`Expected nodes/edges: ${expectedNodeCount}/${expectedEdgeCount}, Actual nodes/edges: ${actualNodeCount}/${actualEdgeCount}`)

      // 如果节点数量为0，不需要布局
      if (expectedNodeCount === 0) {
        console.log('No nodes to layout, skipping')
        return
      }

      // 检查是否已经有布局在运行
      const hasRunningLayout = cyRef.current._private.layouts && cyRef.current._private.layouts.running
      if (hasRunningLayout) {
        console.log('Layout already running, skipping')
        return
      }

      // 如果元素数量不匹配，等待一下再重试
      if (actualNodeCount !== expectedNodeCount || actualEdgeCount !== expectedEdgeCount) {
        console.log('Elements not yet added to Cytoscape, starting retry mechanism...')

        // 重试函数，支持多次重试
        const retryLayout = (retryCount, maxRetries, delay) => {
          if (retryCount > maxRetries) {
            console.log(`Max retries (${maxRetries}) exceeded, skipping layout`)
            return
          }

          console.log(`Retry ${retryCount}/${maxRetries} in ${delay}ms...`)
          const retryTimeout = setTimeout(() => {
            // 检查是否正在进行扩展或删除操作
            console.log('retry - isExpandingRef:', isExpandingRef.current, 'isDeletingRef:', isDeletingRef.current)
            if (isExpandingRef.current || isDeletingRef.current) {
              console.log('Skipping layout retry during expand or delete operation')
              return
            }

            if (!cyRef.current) {
              console.log('Cytoscape instance no longer available')
              return
            }

            const retryNodeCount = cyRef.current.nodes().length
            const retryEdgeCount = cyRef.current.edges().length
            console.log(`Retry ${retryCount} - Actual nodes/edges: ${retryNodeCount}/${retryEdgeCount}, Expected: ${expectedNodeCount}/${expectedEdgeCount}`)

            if (retryNodeCount === expectedNodeCount && retryEdgeCount === expectedEdgeCount) {
              console.log('Elements matched, applying layout...')
              try {
                applySmartLayout(cyRef.current)
              } catch (err) {
                console.warn('Error applying smart layout in retry:', err)
              }
            } else {
              // 继续重试，延迟加倍
              const nextDelay = delay * 2
              retryLayout(retryCount + 1, maxRetries, nextDelay)
            }
          }, delay)

          // 返回清理函数
          return retryTimeout
        }

        // 开始重试：最多3次，初始延迟100ms
        const retryTimeout = retryLayout(1, 3, 100)

        // 清理函数
        return () => {
          if (retryTimeout) {
            clearTimeout(retryTimeout)
          }
        }
      } else {
        // 元素数量匹配，直接应用布局
        // 再次检查是否正在进行扩展或删除操作（以防万一）
        console.log('elements matched - isExpandingRef:', isExpandingRef.current, 'isDeletingRef:', isDeletingRef.current)
        if (isExpandingRef.current || isDeletingRef.current) {
          console.log('Skipping layout (elements matched) during expand or delete operation')
          return
        }
        try {
          applySmartLayout(cyRef.current)
        } catch (err) {
          console.warn('Error applying smart layout in useEffect:', err)
        }
      }

      // Always update node colors based on type
      cyRef.current.nodes().forEach(node => {
        const type = node.data('type')
        if (type && NODE_TYPE_COLORS[type]) {
          node.style('background-color', NODE_TYPE_COLORS[type])
        }
      })

      // Always update edge styles based on binding score
      cyRef.current.edges().forEach(edge => {
        const bindingScore = edge.data('bindingScore')
        if (bindingScore != null && !isNaN(bindingScore)) {
          const width = 1 + bindingScore * 4 // 1 to 5
          const color = bindingScore > 0.5 ? '#dc2626' : '#9ca3af'
          edge.style({
            'width': width,
            'line-color': color,
            'opacity': 0.7
          })
        } else {
          // Default style
          edge.style({
            'width': 2,
            'line-color': '#9ca3af',
            'opacity': 0.7
          })
        }
      })
    }
  }, [cyElements])

  // 清理函数：组件卸载时清理超时
  useEffect(() => {
    return () => {
      // 清理扩展超时
      if (expandTimeoutRef.current) {
        clearTimeout(expandTimeoutRef.current)
      }
      // 清理删除超时
      if (deleteTimeoutRef.current) {
        clearTimeout(deleteTimeoutRef.current)
      }
      // 注意：不手动销毁Cytoscape实例，由react-cytoscapejs管理生命周期
      // 避免double-destroy导致的"Cannot read properties of null (reading 'notify')"错误
      cyRef.current = null
    }
  }, [])

  return (
    <VisualizationContainer>
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* 顶部控制区域：搜索框、操作按钮 */}
        <Card size="small" style={{ marginBottom: '16px' }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={8}>
              <Space.Compact style={{ width: '100%' }}>
                <Input
                  placeholder="Search node ID or name..."
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                  onPressEnter={handleSearch}
                  prefix={<SearchOutlined />}
                />
                <Button type="primary" onClick={handleSearch} loading={loading}>
                  Search
                </Button>
              </Space.Compact>
            </Col>


            <Col xs={24} md={12}>
              <Space wrap>

                <Button icon={<ExpandOutlined />} onClick={handleExpandClick} disabled={!selectedNodeId}>
                  Expand Node
                </Button>

                <Button icon={<ClearOutlined />} onClick={handleReset} danger>
                  Reset
                </Button>

                <Button icon={<FileImageOutlined />} onClick={handleExportPNG} disabled={nodeCount === 0}>
                  Export PNG
                </Button>

                <Button icon={<FileTextOutlined />} onClick={handleExportSVG} disabled={nodeCount === 0}>
                  Export SVG
                </Button>

                <Button
                  onClick={() => {
                    console.log('Testing Cytoscape with sample data')
                    const testElements = [
                      { data: { id: 'test1', label: 'Test Node 1', type: 'miRNA' } },
                      { data: { id: 'test2', label: 'Test Node 2', type: 'mRNA' } },
                      { data: { id: 'edge1', source: 'test1', target: 'test2' } }
                    ]
                    console.log('Setting test elements:', testElements)
                    setCyElements(testElements)
                    setRenderedNodes(['test1', 'test2'])
                    setNodeCount(2)
                    setEdgeCount(1)
                  }}
                >
                  Test Render
                </Button>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 主内容区域：Cytoscape画布和节点列表侧边栏 */}
        <Row gutter={16} style={{ flex: 1, minHeight: 0 }}>
          {/* 左侧：Cytoscape可视化画布 */}
          <Col xs={24} md={showNodeList ? 16 : 24}>
            <Card style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
              {error && (
                <Alert
                  message="Error"
                  description={error}
                  type="error"
                  showIcon
                  closable
                  onClose={() => setError(null)}
                  style={{ marginBottom: '16px' }}
                />
              )}

              <div style={{ height: '600px', position: 'relative', border: '1px solid #e5e7eb' }}>
                <CytoscapeComponent
                  elements={cyElements}
                  style={{ width: '100%', height: '100%' }}
                  stylesheet={cyStylesheet}
                  cy={handleCyInit}
                  layout={{ name: 'null' }}  // 禁用Cytoscape默认布局，完全由我们控制
                />
              </div>

              {/* 统计信息覆盖层：显示节点和边的数量统计 */}
              <Box sx={{
                position: 'absolute',
                top: 10,
                right: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '12px',
                zIndex: 1000
              }}>
                <div><strong>Nodes:</strong> {nodeCount} / 500</div>
                <div><strong>Edges:</strong> {edgeCount}</div>
                {selectedNodeId && (
                  <div><strong>Selected:</strong> {selectedNodeId}</div>
                )}
              </Box>

              {/* 图例覆盖层：显示节点类型颜色编码图例 */}
              <Box sx={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                padding: '8px 12px',
                borderRadius: '4px',
                fontSize: '11px',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Node Types</div>
                {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '2px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }}></div>
                    <span>{NODE_TYPE_LABELS[type] || type}</span>
                  </div>
                ))}
              </Box>

              {/* 边信息覆盖层：显示悬停边的详细信息 */}
              {hoveredEdgeInfo && (
                <Box sx={{
                  position: 'absolute',
                  bottom: 10,
                  right: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                  zIndex: 1000,
                  maxWidth: '300px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Edge Details</div>
                  <div><strong>Source:</strong> {hoveredEdgeInfo.source}</div>
                  <div><strong>Target:</strong> {hoveredEdgeInfo.target}</div>
                  {hoveredEdgeInfo.species && <div><strong>Species:</strong> {hoveredEdgeInfo.species}</div>}
                  {hoveredEdgeInfo.database && <div><strong>Database:</strong> {hoveredEdgeInfo.database}</div>}
                  {hoveredEdgeInfo.interactionType && <div><strong>Type:</strong> {hoveredEdgeInfo.interactionType}</div>}
                  {hoveredEdgeInfo.regulateType && <div><strong>Regulation:</strong> {hoveredEdgeInfo.regulateType}</div>}
                  {hoveredEdgeInfo.bindingScore && <div><strong>Binding Score:</strong> {hoveredEdgeInfo.bindingScore}</div>}
                </Box>
              )}

              {/* 节点信息覆盖层：显示选中节点的详细信息和操作按钮 */}
              {selectedNodeInfo && (
                <Box sx={{
                  position: 'absolute',
                  top: 60,
                  left: 10,
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  padding: '12px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  fontSize: '12px',
                  zIndex: 1000,
                  maxWidth: '300px'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>Node Details</div>
                  <div><strong>ID:</strong> {selectedNodeInfo.id}</div>
                  <div><strong>Label:</strong> {selectedNodeInfo.label}</div>
                  <div><strong>Type:</strong> {selectedNodeInfo.type}</div>
                  {selectedNodeInfo.name && <div><strong>Name:</strong> {selectedNodeInfo.name}</div>}
                  <div style={{ marginTop: '8px' }}>
                    <Space>
                      <Button size="small" onClick={() => handleExpandNode(selectedNodeInfo.id)}>
                        Expand Neighbors
                      </Button>
                      <Button
                        size="small"
                        onClick={() => handleDeleteNode(selectedNodeInfo.id)}
                        danger
                      >
                        Delete Node
                      </Button>
                    </Space>
                  </div>
                </Box>
              )}
            </Card>
          </Col>

          {/* 右侧：节点列表和搜索结果侧边栏 */}
          {showNodeList && (
            <Col xs={24} md={8}>
              <Card
                size="small"
                style={{ height: '100%' }}
                title={<span>Node List ({renderedNodes.length})</span>}
                extra={
                  <Button type="primary" size="small" onClick={() => setShowNodeList(false)}>
                    Hide
                  </Button>
                }
              >
                <div style={{ height: '100%', overflow: 'auto' }}>
                  {/* 已渲染节点列表：显示当前可视化的所有节点 */}
                  <div style={{ marginBottom: '16px' }}>
                    <Text strong>Rendered Nodes:</Text>
                    <List
                      size="small"
                      dataSource={renderedNodes}
                      renderItem={(nodeId) => (
                        <List.Item
                          style={{ cursor: 'pointer', padding: '8px' }}
                          onClick={() => {
                            if (cyRef.current) {
                              const node = cyRef.current.getElementById(nodeId)
                              if (node) {
                                node.select()
                                setSelectedNodeId(nodeId)
                                setSelectedNodeInfo(node.data())
                              }
                            }
                          }}
                        >
                          <Tag color={selectedNodeId === nodeId ? 'blue' : 'default'} style={{ width: '100%' }}>
                            {nodeId}
                          </Tag>
                        </List.Item>
                      )}
                    />
                  </div>

                  {/* 搜索结果列表：显示搜索到的节点，点击可加载其邻居 */}
                  {searchResults.length > 0 && (
                    <div>
                      <Text strong>Search Results:</Text>
                      <List
                        size="small"
                        dataSource={searchResults}
                        renderItem={(node) => (
                          <List.Item
                            style={{ cursor: 'pointer', padding: '8px' }}
                            onClick={() => handleSearchResultClick(node)}
                          >
                            <div style={{ width: '100%' }}>
                              <div><strong>{node.node_id}</strong></div>
                              <div style={{ fontSize: '11px', color: '#666' }}>
                                Type: {node.node_type} | Name: {node.node_name}
                              </div>
                            </div>
                          </List.Item>
                        )}
                      />
                    </div>
                  )}

                  {/* 提示信息区域：空状态时显示搜索提示 */}
                  {renderedNodes.length === 0 && (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                      <SearchOutlined style={{ fontSize: '24px', marginBottom: '8px' }} />
                      <div>Search for a node to start visualization</div>
                      <div style={{ fontSize: '11px', marginTop: '8px' }}>
                        Enter a node ID or name in the search box above
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </Col>
          )}

          {/* Show node list button when hidden */}
          {!showNodeList && (
            <Box sx={{ position: 'absolute', right: 10, bottom: 10, zIndex: 1000 }}>
              <Button
                type="primary"
                size="small"
                onClick={() => setShowNodeList(true)}
              >
                Show Node List
              </Button>
            </Box>
          )}
        </Row>

        {/* 加载覆盖层：数据加载时显示旋转加载器 */}
        {loading && (
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000
          }}>
            <Spin size="large" />
          </Box>
        )}
      </Box>
    </VisualizationContainer>
  )
}

export default CeRNAInteractionGraph