/**
 * PathSearchGraph - ceRNA 多级通路搜索与可视化组件
 * 基于 Cytoscape.js，支持两个 RNA 分子间的多跳通路搜索、高亮、导出
 */
import { useState, useEffect, useRef, useCallback } from 'react'
import cytoscape from 'cytoscape'
import CytoscapeComponent from 'react-cytoscapejs'
import cytoscapeSvg from 'cytoscape-svg'
import { Box } from '@mui/system'
import { Card, Row, Col, Input, Button, Typography, Space, Select, Tag, Spin, Alert, Tooltip, message } from 'antd'
import {
  SearchOutlined, ClearOutlined, DownloadOutlined,
  NodeIndexOutlined, ApartmentOutlined
} from '@ant-design/icons'
import { fetchPathSearch, searchNodes } from '@/services/ceRNAApi'

cytoscape.use(cytoscapeSvg)

const { Text } = Typography

// 节点类型颜色映射
const NODE_TYPE_COLORS = {
  miRNA: '#3b82f6',
  mRNA: '#10b981',
  lncRNA: '#ef4444',
  other: '#6b7280'
}

const NODE_TYPE_LABELS = {
  miRNA: 'miRNA',
  mRNA: 'mRNA',
  lncRNA: 'lncRNA',
  other: 'Other'
}

// 通路配色方案
const PATH_COLORS = [
  '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#84cc16'
]

// Cytoscape 样式表
const cyStylesheet = [
  {
    selector: 'node',
    style: {
      'background-color': '#6b7280',
      'label': 'data(label)',
      'width': 45,
      'height': 45,
      'font-size': '11px',
      'font-weight': 'bold',
      'text-valign': 'center',
      'text-halign': 'center',
      'text-max-width': '90px',
      'text-wrap': 'wrap',
      'border-width': 2,
      'border-color': '#ffffff',
      'border-opacity': 1,
      'transition-property': 'background-color, border-color, border-width',
      'transition-duration': '0.2s'
    }
  },
  {
    selector: 'node[type = "miRNA"]',
    style: { 'background-color': NODE_TYPE_COLORS.miRNA }
  },
  {
    selector: 'node[type = "mRNA"]',
    style: { 'background-color': NODE_TYPE_COLORS.mRNA }
  },
  {
    selector: 'node[type = "lncRNA"]',
    style: { 'background-color': NODE_TYPE_COLORS.lncRNA }
  },
  {
    selector: 'node[type = "other"]',
    style: { 'background-color': NODE_TYPE_COLORS.other }
  },
  {
    selector: 'node.highlighted',
    style: { 'border-width': 4, 'border-color': '#1f2937' }
  },
  {
    selector: 'node.dimmed',
    style: { 'opacity': 0.2 }
  },
  {
    selector: 'node.hide-label',
    style: { 'label': '' }
  },
  {
    selector: 'node.source-node',
    style: { 'border-width': 4, 'border-color': '#f59e0b' }
  },
  {
    selector: 'node.target-node',
    style: { 'border-width': 4, 'border-color': '#8b5cf6' }
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#d1d5db',
      'opacity': 0.6,
      'curve-style': 'bezier',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': '#d1d5db',
      'arrow-scale': 0.8,
      'transition-property': 'line-color, width, opacity',
      'transition-duration': '0.2s'
    }
  },
  {
    selector: 'edge.path-highlighted',
    style: { 'width': 4, 'opacity': 1 }
  },
  {
    selector: 'edge.dimmed',
    style: { 'opacity': 0.08 }
  }
]

const PathSearchGraph = () => {
  // Refs
  const cyRef = useRef(null)
  const layoutVersionRef = useRef(0)

  // 搜索参数
  const [sourceName, setSourceName] = useState('')
  const [targetName, setTargetName] = useState('')
  const [maxHop, setMaxHop] = useState(3)

  // 搜索结果数据
  const [paths, setPaths] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [sourceType, setSourceType] = useState('unknown')
  const [targetType, setTargetType] = useState('unknown')

  // UI 状态
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [selectedEdge, setSelectedEdge] = useState(null)
  const [activePathIndex, setActivePathIndex] = useState(-1) // -1 = 全部显示
  const [layoutName, setLayoutName] = useState('breadthfirst')
  const [showLabels, setShowLabels] = useState(true)
  const [filterType, setFilterType] = useState('all')
  const [cyElements, setCyElements] = useState([])

  // 搜索建议
  const [sourceSuggestions, setSourceSuggestions] = useState([])
  const [targetSuggestions, setTargetSuggestions] = useState([])

  // 导出
  const [exporting, setExporting] = useState(false)

  // 从后端数据构建 Cytoscape elements
  const buildCyElements = useCallback((nodesData, edgesData, source, target) => {
    const elements = []

    nodesData.forEach(node => {
      const el = {
        data: {
          id: node.id,
          label: node.name || node.id,
          type: node.type || 'other',
          name: node.name || node.id
        },
        classes: ''
      }
      if (node.id === source) el.classes = 'source-node'
      if (node.id === target) el.classes += ' target-node'
      elements.push(el)
    })

    edgesData.forEach((edge, idx) => {
      elements.push({
        data: {
          id: edge.id || `edge_${edge.source}_${edge.target}_${idx}`,
          source: edge.source,
          target: edge.target,
          species: edge.species || '',
          database: edge.database || '',
          cerna_type: edge.cerna_type || '',
          regulate_type: edge.regulate_type || 'unknown',
          binding_score: edge.binding_score
        }
      })
    })

    return elements
  }, [])

  // 搜索节点建议：输入变化时直接更新 state
  const handleSourceSearch = useCallback((value) => {
    setSourceName(value)
  }, [])

  const handleTargetSearch = useCallback((value) => {
    setTargetName(value)
  }, [])

  // 防抖获取建议：监听 sourceName 变化，300ms 后调用 API
  useEffect(() => {
    if (sourceName.length < 2) {
      setSourceSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchNodes({ search_key: sourceName })
        setSourceSuggestions(results.slice(0, 10))
      } catch {
        setSourceSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [sourceName])

  // 防抖获取建议：监听 targetName 变化，300ms 后调用 API
  useEffect(() => {
    if (targetName.length < 2) {
      setTargetSuggestions([])
      return
    }
    const timer = setTimeout(async () => {
      try {
        const results = await searchNodes({ search_key: targetName })
        setTargetSuggestions(results.slice(0, 10))
      } catch {
        setTargetSuggestions([])
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [targetName])

  // 执行通路搜索
  const handleSearch = async () => {
    if (!sourceName.trim() || !targetName.trim()) {
      setError('Please enter source RNA and target RNA')
      return
    }

    setLoading(true)
    setError(null)
    setSelectedNode(null)
    setSelectedEdge(null)
    setActivePathIndex(-1)
    setSourceSuggestions([])
    setTargetSuggestions([])

    try {
      const result = await fetchPathSearch({
        source_name: sourceName.trim(),
        target_name: targetName.trim(),
        max_hop: maxHop
      })

      console.log('[PathSearch] result:', result)
      console.log('[PathSearch] nodes:', result.nodes.length, 'edges:', result.edges.length, 'paths:', result.paths.length)

      setPaths(result.paths)
      setStatistics(result.statistics)
      setSourceType(result.source_type)
      setTargetType(result.target_type)

      const elements = buildCyElements(result.nodes, result.edges, sourceName.trim(), targetName.trim())
      console.log('[PathSearch] cyElements:', elements.length)
      setCyElements(elements)

      if (result.paths.length === 0) {
        if (result.nodes.length <= 2) {
          setError(`No pathway found from ${sourceName.trim()} to ${targetName.trim()} within ${maxHop} hops. The nodes may not exist in the database, or the distance exceeds ${maxHop} hops.`)
        } else {
          setError(`No direct pathway found from ${sourceName.trim()} to ${targetName.trim()} within ${maxHop} hops, but ${result.nodes.length} related nodes were found and rendered on the canvas.`)
        }
      } else {
        setError(null)
      }
    } catch (err) {
      setError('Search failed: ' + err.message)
      console.error('[PathSearch] error:', err)
    } finally {
      setLoading(false)
    }
  }

  // Cytoscape 初始化
  const handleCyInit = useCallback((cy) => {
    // 避免对同一实例重复绑定事件
    if (cyRef.current === cy) return
    cyRef.current = cy

    // 节点点击
    cy.on('tap', 'node', (evt) => {
      const node = evt.target
      setSelectedNode(node.data())
      setSelectedEdge(null)
    })

    // 边点击
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target
      setSelectedEdge(edge.data())
      setSelectedNode(null)
    })

    // 空白区域点击
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null)
        setSelectedEdge(null)
      }
    })
  }, [])

  // 当 cyElements 变化时应用布局（react-cytoscapejs 负责元素同步，我们不手动操作元素）
  useEffect(() => {
    if (!cyRef.current || cyElements.length === 0) return

    const cy = cyRef.current
    layoutVersionRef.current += 1
    const currentVersion = layoutVersionRef.current

    const layoutOptions = {
      name: layoutName,
      animate: true,
      animationDuration: 600,
      fit: true,
      padding: 60,
      directed: true
    }

    if (layoutName === 'breadthfirst') {
      layoutOptions.avoidOverlap = true
      layoutOptions.nodeDimensionsIncludeLabels = true
      layoutOptions.spacingFactor = 1.3
    } else if (layoutName === 'concentric') {
      layoutOptions.avoidOverlap = true
      layoutOptions.minNodeSpacing = 80
    } else if (layoutName === 'cose') {
      layoutOptions.nodeOverlap = 20
      layoutOptions.idealEdgeLength = 100
      layoutOptions.nodeRepulsion = 8000
    } else if (layoutName === 'circle') {
      layoutOptions.avoidOverlap = true
    }

    // 延迟执行布局，确保 react-cytoscapejs 已完成元素同步
    const timer = setTimeout(() => {
      // 如果版本已过期（新的元素或布局变更），跳过
      if (layoutVersionRef.current !== currentVersion) return
      if (!cyRef.current || cyRef.current !== cy) return
      // 如果实例已被销毁，跳过
      if (cy.destroyed()) return

      // 清除之前的布局再启动新的
      try { cy.layout({ name: 'null' }).stop() } catch (_) { /* ok */ }
      try {
        cy.layout(layoutOptions).run()
      } catch (e) {
        console.warn('Layout error:', e)
      }
    }, 150)

    return () => clearTimeout(timer)
  }, [cyElements, layoutName])

  // 通路高亮逻辑
  useEffect(() => {
    if (!cyRef.current) return

    const cy = cyRef.current

    // 先清除所有高亮
    cy.nodes().removeClass('highlighted dimmed')
    cy.edges().removeClass('path-highlighted dimmed')

    if (activePathIndex === -1) {
      // 显示全部通路，每条边用对应的通路颜色
      if (paths.length > 0 && paths.length <= 10) {
        // 为每条边找到属于哪条通路，并着色
        const edgePathMap = {}
        paths.forEach((p, pi) => {
          p.edges.forEach(edgeId => {
            if (!edgePathMap[edgeId]) edgePathMap[edgeId] = []
            edgePathMap[edgeId].push(pi)
          })
        })

        cy.edges().forEach(edge => {
          const eid = edge.data('id')
          if (edgePathMap[eid] && edgePathMap[eid].length === 1) {
            const pi = edgePathMap[eid][0]
            edge.style({
              'line-color': PATH_COLORS[pi % PATH_COLORS.length],
              'target-arrow-color': PATH_COLORS[pi % PATH_COLORS.length],
              'width': 3,
              'opacity': 0.9
            })
          }
        })
      }
      cy.nodes().style('opacity', 1)
      return
    }

    // 高亮指定通路
    const activePath = paths[activePathIndex]
    if (!activePath) return

    const pathEdgeIds = new Set(activePath.edges)
    const pathNodeIds = new Set(activePath.nodes)

    cy.nodes().forEach(node => {
      if (pathNodeIds.has(node.data('id'))) {
        node.addClass('highlighted')
      } else {
        node.addClass('dimmed')
      }
    })

    cy.edges().forEach(edge => {
      if (pathEdgeIds.has(edge.data('id'))) {
        edge.addClass('path-highlighted')
        edge.style({
          'line-color': activePath.color || PATH_COLORS[activePathIndex % PATH_COLORS.length],
          'target-arrow-color': activePath.color || PATH_COLORS[activePathIndex % PATH_COLORS.length]
        })
      } else {
        edge.addClass('dimmed')
      }
    })
  }, [activePathIndex, paths])

  // 标签显示切换
  useEffect(() => {
    if (!cyRef.current) return
    if (showLabels) {
      cyRef.current.nodes().removeClass('hide-label')
    } else {
      cyRef.current.nodes().addClass('hide-label')
    }
  }, [showLabels, cyElements])

  // 节点类型过滤
  useEffect(() => {
    if (!cyRef.current) return
    if (filterType === 'all') {
      cyRef.current.nodes().style('display', 'element')
    } else {
      cyRef.current.nodes().forEach(node => {
        node.style('display', node.data('type') === filterType ? 'element' : 'none')
      })
    }
  }, [filterType])

  // 导出图片
  const handleExportPNG = () => {
    if (!cyRef.current) return
    setExporting(true)
    try {
      const png = cyRef.current.png({
        output: 'blob',
        full: true,
        bg: '#ffffff',
        scale: 2
      })
      const url = URL.createObjectURL(png)
      const a = document.createElement('a')
      a.href = url
      a.download = `ceRNA_path_${sourceName}_${targetName}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      message.success('PNG export successful')
    } catch (e) {
      console.error('PNG export error:', e)
      message.error('PNG export failed: ' + (e.message || 'Unknown error'))
    }
    setExporting(false)
  }

  // 导出 SVG
  const handleExportSVG = () => {
    if (!cyRef.current) return
    setExporting(true)
    try {
      const cy = cyRef.current

      // cy.svg() 与 bypass styles 不兼容，导出前临时保存并清除
      const savedNodeStyles = []
      cy.nodes().forEach(node => {
        const styles = {}
        ;['label', 'opacity', 'display'].forEach(key => {
          styles[key] = node.style(key)
        })
        savedNodeStyles.push({ node, styles })
        node.removeStyle()
      })

      const savedEdgeStyles = []
      cy.edges().forEach(edge => {
        const styles = {}
        ;['line-color', 'target-arrow-color', 'width', 'opacity'].forEach(key => {
          styles[key] = edge.style(key)
        })
        savedEdgeStyles.push({ edge, styles })
        edge.removeStyle()
      })

      // 导出 SVG
      const svg = cy.svg({ full: true, scale: 2 })

      // 恢复 bypass styles
      savedNodeStyles.forEach(({ node, styles }) => {
        Object.entries(styles).forEach(([key, val]) => {
          if (val !== undefined) node.style(key, val)
        })
      })
      savedEdgeStyles.forEach(({ edge, styles }) => {
        Object.entries(styles).forEach(([key, val]) => {
          if (val !== undefined) edge.style(key, val)
        })
      })

      // 触发下载（appendChild 确保跨浏览器兼容）
      const blob = new Blob([svg], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ceRNA_path_${sourceName}_${targetName}.svg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      setTimeout(() => URL.revokeObjectURL(url), 100)
      message.success('SVG export successful')
    } catch (e) {
      console.error('SVG export error:', e)
      message.error('SVG export failed: ' + (e.message || 'Unknown error'))
    }
    setExporting(false)
  }

  // 重置
  const handleReset = () => {
    setCyElements([])
    setPaths([])
    setStatistics(null)
    setSelectedNode(null)
    setSelectedEdge(null)
    setActivePathIndex(-1)
    setError(null)
    setFilterType('all')
  }

  // 删除节点
  const handleDeleteNode = (nodeId) => {
    if (!nodeId) return

    // 从 Cytoscape 实例中移除节点
    if (cyRef.current && !cyRef.current.destroyed()) {
      const node = cyRef.current.getElementById(nodeId)
      if (node) node.remove()
    }

    // 更新 cyElements 状态
    setCyElements(prev => prev.filter(el => {
      if (el.data.id === nodeId && !el.data.source) return false
      if (el.data.source === nodeId || el.data.target === nodeId) return false
      return true
    }))

    // 更新 paths：移除包含已删除节点的通路，并分配颜色
    setPaths(prev => prev
      .filter(p => !p.nodes.includes(nodeId))
      .map((p, idx) => ({
        ...p,
        color: PATH_COLORS[idx % PATH_COLORS.length]
      }))
    )

    // 更新 statistics
    setStatistics(prev => {
      if (!prev) return null
      const newTotalPaths = paths.filter(p => !p.nodes.includes(nodeId)).length
      return { ...prev, total_paths: newTotalPaths }
    })

    // 清除选中状态
    setSelectedNode(null)
    setSelectedEdge(null)
  }

  // 交换源和目标
  const handleSwap = () => {
    setSourceName(targetName)
    setTargetName(sourceName)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 280px)' }}>
      {/* 搜索控制面板 */}
      <Card size="small" style={{ marginBottom: 12 }}>
        <Row gutter={[12, 12]} align="middle">
          <Col xs={24} sm={6}>
            <Text strong style={{ fontSize: 12 }}>Source RNA</Text>
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Enter source RNA name..."
                value={sourceName}
                onChange={(e) => handleSourceSearch(e.target.value)}
                prefix={<NodeIndexOutlined />}
                size="middle"
                allowClear
              />
              {sourceSuggestions.length > 0 && (
                <Box sx={{
                  position: 'absolute', zIndex: 1000, background: '#fff',
                  border: '1px solid #e5e7eb', borderRadius: 1, maxHeight: 150,
                  overflow: 'auto', width: '100%', mt: 0.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {sourceSuggestions.map(s => (
                    <Box key={s.node_id} sx={{
                      px: 2, py: 1, cursor: 'pointer', fontSize: 12,
                      '&:hover': { bg: '#f3f4f6' }
                    }} onClick={() => {
                      setSourceName(s.node_id)
                      setSourceSuggestions([])
                    }}>
                      <Tag color={NODE_TYPE_COLORS[s.node_type] || '#6b7280'}>{s.node_type}</Tag>
                      {s.node_id}
                    </Box>
                  ))}
                </Box>
              )}
            </div>
          </Col>

          <Col xs={24} sm={1} style={{ textAlign: 'center' }}>
            <Tooltip title="Swap source and target">
              <Button shape="circle" icon={<span>⇄</span>} onClick={handleSwap} size="small" />
            </Tooltip>
          </Col>

          <Col xs={24} sm={6}>
            <Text strong style={{ fontSize: 12 }}>Target RNA</Text>
            <div style={{ position: 'relative' }}>
              <Input
                placeholder="Enter target RNA name..."
                value={targetName}
                onChange={(e) => handleTargetSearch(e.target.value)}
                prefix={<NodeIndexOutlined />}
                size="middle"
                allowClear
              />
              {targetSuggestions.length > 0 && (
                <Box sx={{
                  position: 'absolute', zIndex: 1000, background: '#fff',
                  border: '1px solid #e5e7eb', borderRadius: 1, maxHeight: 150,
                  overflow: 'auto', width: '100%', mt: 0.5, boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                }}>
                  {targetSuggestions.map(s => (
                    <Box key={s.node_id} sx={{
                      px: 2, py: 1, cursor: 'pointer', fontSize: 12,
                      '&:hover': { bg: '#f3f4f6' }
                    }} onClick={() => {
                      setTargetName(s.node_id)
                      setTargetSuggestions([])
                    }}>
                      <Tag color={NODE_TYPE_COLORS[s.node_type] || '#6b7280'}>{s.node_type}</Tag>
                      {s.node_id}
                    </Box>
                  ))}
                </Box>
              )}
            </div>
          </Col>

          <Col xs={12} sm={3}>
            <Text strong style={{ fontSize: 12 }}>Max Hops</Text>
            <Select
              value={maxHop}
              onChange={setMaxHop}
              style={{ width: '100%' }}
              options={[1, 2, 3, 4, 5].map(n => ({ value: n, label: `${n} hop${n > 1 ? 's' : ''}` }))}
            />
          </Col>

          <Col xs={12} sm={4}>
            <Space style={{ marginTop: 4 }}>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
                loading={loading}
                size="middle"
              >
                Search
              </Button>
              <Button icon={<ClearOutlined />} onClick={handleReset} danger size="middle">
                Reset
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 主内容区域 */}
      <Row gutter={12} style={{ flex: 1, minHeight: 0 }}>
        {/* Cytoscape 可视化 */}
        <Col xs={24} md={16} style={{ display: 'flex', flexDirection: 'column' }}>
          <Card
            size="small"
            style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            styles={{ body: { flex: 1, padding: 0, position: 'relative' } }}
          >
            {/* 工具栏 */}
            <Box sx={{
              display: 'flex', alignItems: 'center', gap: 1, px: 1.5, py: 1,
              borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap'
            }}>
              <Select
                value={layoutName}
                onChange={setLayoutName}
                size="small"
                style={{ width: 130 }}
                options={[
                  { value: 'breadthfirst', label: 'Breadthfirst' },
                  { value: 'concentric', label: 'Concentric' },
                  { value: 'cose', label: 'Force-Directed' },
                  { value: 'circle', label: 'Circle' },
                  { value: 'grid', label: 'Grid' }
                ]}
              />
              <Select
                value={filterType}
                onChange={setFilterType}
                size="small"
                style={{ width: 110 }}
                options={[
                  { value: 'all', label: 'All Types' },
                  { value: 'miRNA', label: 'miRNA' },
                  { value: 'mRNA', label: 'mRNA' },
                  { value: 'lncRNA', label: 'lncRNA' }
                ]}
              />
              <Tooltip title="Show / hide labels">
                <Button
                  size="small"
                  type={showLabels ? 'primary' : 'default'}
                  onClick={() => setShowLabels(!showLabels)}
                >
                  Labels
                </Button>
              </Tooltip>
              <Tooltip title="Export as PNG">
                <Button size="small" icon={<DownloadOutlined />} onClick={handleExportPNG} loading={exporting}>
                  PNG
                </Button>
              </Tooltip>
              <Tooltip title="Export as SVG">
                <Button size="small" icon={<DownloadOutlined />} onClick={handleExportSVG} loading={exporting}>
                  SVG
                </Button>
              </Tooltip>
            </Box>

            {error && (
              <Alert message={error} type="error" showIcon closable onClose={() => setError(null)} style={{ margin: 8 }} />
            )}

            {/* Cytoscape 画布 */}
            <Box sx={{ flex: 1, position: 'relative', minHeight: 500, width: '100%' }}>
              <CytoscapeComponent
                elements={cyElements}
                stylesheet={cyStylesheet}
                cy={handleCyInit}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
                layout={{ name: 'null' }}
              />

              {/* 图例 */}
              <Box sx={{
                position: 'absolute', bottom: 8, left: 8,
                background: 'rgba(255,255,255,0.92)', borderRadius: 1,
                px: 1.5, py: 1, fontSize: 11, border: '1px solid #e5e7eb',
                zIndex: 1000
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Legend</div>
                {Object.entries(NODE_TYPE_COLORS).map(([type, color]) => (
                  <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 2 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: type === 'miRNA' ? 0 : type === 'lncRNA' ? 0 : '50%',
                      backgroundColor: color,
                      transform: type === 'miRNA' ? 'rotate(45deg)' : type === 'lncRNA' ? 'rotate(45deg)' : 'none'
                    }} />
                    <span>{NODE_TYPE_LABELS[type] || type}</span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: '3px solid #f59e0b' }} />
                  <span>Source Node</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', border: '3px solid #8b5cf6' }} />
                  <span>Target Node</span>
                </div>
              </Box>

              {/* 统计信息 */}
              {statistics && (
                <Box sx={{
                  position: 'absolute', top: 8, right: 8,
                  background: 'rgba(255,255,255,0.92)', borderRadius: 1,
                  px: 1.5, py: 1, fontSize: 11, border: '1px solid #e5e7eb',
                  zIndex: 1000
                }}>
                  <div><strong>Nodes:</strong> {statistics.node_count}</div>
                  <div><strong>Edges:</strong> {statistics.edge_count}</div>
                  <div><strong>Paths:</strong> {statistics.total_paths}</div>
                </Box>
              )}

              {/* 选中节点信息 */}
              {selectedNode && (
                <Box sx={{
                  position: 'absolute', top: 8, left: 120,
                  background: 'rgba(255,255,255,0.95)', borderRadius: 1,
                  px: 2, py: 1.5, fontSize: 12, border: '1px solid #d1d5db',
                  zIndex: 1000, maxWidth: 280
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 8 }}>
                    <Tag color={NODE_TYPE_COLORS[selectedNode.type] || '#6b7280'}>
                      {selectedNode.type}
                    </Tag>
                    {selectedNode.label}
                  </div>
                  <div><strong>ID:</strong> {selectedNode.id}</div>
                  <div><strong>Name:</strong> {selectedNode.name || selectedNode.id}</div>
                  <div style={{ marginTop: 8 }}>
                    <Space>
                      <Button
                        size="small"
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        danger
                      >
                        Delete Node
                      </Button>
                    </Space>
                  </div>
                </Box>
              )}

              {/* 选中边信息 */}
              {selectedEdge && (
                <Box sx={{
                  position: 'absolute', top: 8, left: 120,
                  background: 'rgba(255,255,255,0.95)', borderRadius: 1,
                  px: 2, py: 1.5, fontSize: 12, border: '1px solid #d1d5db',
                  zIndex: 1000, maxWidth: 300
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Edge Details</div>
                  <div><strong>Source:</strong> {selectedEdge.source}</div>
                  <div><strong>Target:</strong> {selectedEdge.target}</div>
                  {selectedEdge.species && <div><strong>Species:</strong> {selectedEdge.species}</div>}
                  {selectedEdge.database && <div><strong>Database:</strong> {selectedEdge.database}</div>}
                  {selectedEdge.regulate_type && <div><strong>Regulation:</strong> {selectedEdge.regulate_type}</div>}
                  {selectedEdge.binding_score != null && (
                    <div><strong>Binding Score:</strong> {selectedEdge.binding_score}</div>
                  )}
                </Box>
              )}

              {/* 加载蒙层 */}
              {loading && (
                <Box sx={{
                  position: 'absolute', inset: 0,
                  background: 'rgba(255,255,255,0.6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  zIndex: 2000
                }}>
                  <Spin size="large" tip="Searching pathways..." />
                </Box>
              )}
            </Box>
          </Card>
        </Col>

        {/* 右侧面板：通路列表 + 节点类型筛选 */}
        <Col xs={24} md={8}>
          <Card
            size="small"
            title={
              <Space>
                <ApartmentOutlined />
                <span>Pathways ({paths.length})</span>
              </Space>
            }
            style={{ height: '100%' }}
            styles={{ body: { padding: 0 } }}
          >
            <Box sx={{ height: 400, overflow: 'auto' }}>
              {paths.length === 0 && !loading && (
                <Box sx={{ textAlign: 'center', py: 8, color: '#9ca3af' }}>
                  <SearchOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                  <div>Enter source and target RNA</div>
                  <div>to search for multi-hop pathways</div>
                </Box>
              )}

              {/* 全部显示 / 清除高亮 */}
              {paths.length > 0 && (
                <Box sx={{ px: 2, py: 1, borderBottom: '1px solid #f0f0f0' }}>
                  <Button
                    size="small"
                    type={activePathIndex === -1 ? 'primary' : 'default'}
                    block
                    onClick={() => setActivePathIndex(-1)}
                  >
                    Show All Pathways
                  </Button>
                </Box>
              )}

              {paths.map((p, idx) => (
                <Box
                  key={p.id}
                  sx={{
                    px: 2, py: 1.5, cursor: 'pointer',
                    borderBottom: '1px solid #f5f5f5',
                    background: activePathIndex === idx ? '#eff6ff' : 'transparent',
                    '&:hover': { background: '#f9fafb' }
                  }}
                  onClick={() => setActivePathIndex(activePathIndex === idx ? -1 : idx)}
                >
                  <Space style={{ marginBottom: 4 }}>
                    <div style={{
                      width: 12, height: 12, borderRadius: 2,
                      backgroundColor: p.color || PATH_COLORS[idx % PATH_COLORS.length]
                    }} />
                    <Text strong style={{ fontSize: 12 }}>
                      Path #{idx + 1}
                    </Text>
                    <Tag color="blue" style={{ fontSize: 10 }}>{p.length} hop{p.length > 1 ? 's' : ''}</Tag>
                  </Space>
                  <div style={{ fontSize: 11, color: '#6b7280', wordBreak: 'break-all' }}>
                    {p.nodes.join(' → ')}
                  </div>
                </Box>
              ))}
            </Box>

            {/* 通路统计 */}
            {statistics && statistics.total_paths > 0 && (
              <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid #f0f0f0', fontSize: 11 }}>
                <Row gutter={8}>
                  <Col span={12}>
                    <div style={{ color: '#6b7280' }}>Source Type</div>
                    <Tag color={NODE_TYPE_COLORS[sourceType] || '#6b7280'}>{sourceType}</Tag>
                  </Col>
                  <Col span={12}>
                    <div style={{ color: '#6b7280' }}>Target Type</div>
                    <Tag color={NODE_TYPE_COLORS[targetType] || '#6b7280'}>{targetType}</Tag>
                  </Col>
                </Row>
                <Row gutter={8} style={{ marginTop: 8 }}>
                  <Col span={8}>
                    <div style={{ color: '#6b7280' }}>Total Nodes</div>
                    <Text strong>{statistics.node_count}</Text>
                  </Col>
                  <Col span={8}>
                    <div style={{ color: '#6b7280' }}>Total Edges</div>
                    <Text strong>{statistics.edge_count}</Text>
                  </Col>
                  <Col span={8}>
                    <div style={{ color: '#6b7280' }}>Total Paths</div>
                    <Text strong>{statistics.total_paths}</Text>
                  </Col>
                </Row>
              </Box>
            )}
          </Card>
        </Col>
      </Row>
    </Box>
  )
}

export default PathSearchGraph
