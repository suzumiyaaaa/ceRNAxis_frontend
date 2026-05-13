import { useEffect, useRef, useState, useMemo } from "react"
import { useContainerSize } from "@/components/common/container/ResponsiveVisualizationContainer"
import * as d3 from "d3"
import { Box } from "@mui/system"
import VisualizationContainer from "@/components/ui/container/VisualizationContainer"

// 节点关系图组件
const NodeRelationshipGraph = ({ data }) => {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const { width, height } = useContainerSize()
    const [selectedNode, setSelectedNode] = useState(null)
    const [hoveredNode, setHoveredNode] = useState(null)
    const [correlationThreshold, setCorrelationThreshold] = useState(0.3)
    const simulationRef = useRef(null)

    // 处理数据：如果没有提供数据，使用默认模拟数据
    const graphData = useMemo(() => {
        if (data) return data

        // 默认模拟数据：基因相关性网络
        const nodes = [
            { id: "TP53", name: "TP53", type: "tumor_suppressor", expression: 2.1 },
            { id: "PTEN", name: "PTEN", type: "tumor_suppressor", expression: 3.5 },
            { id: "MYC", name: "MYC", type: "oncogene", expression: 4.8 },
            { id: "EGFR", name: "EGFR", type: "oncogene", expression: 3.9 },
            { id: "KRAS", name: "KRAS", type: "oncogene", expression: 5.2 },
            { id: "BRCA1", name: "BRCA1", type: "dna_repair", expression: 2.8 },
            { id: "BRCA2", name: "BRCA2", type: "dna_repair", expression: 2.5 },
            { id: "AKT1", name: "AKT1", type: "signaling", expression: 3.7 },
            { id: "PIK3CA", name: "PIK3CA", type: "signaling", expression: 4.1 },
            { id: "VEGFA", name: "VEGFA", type: "angiogenesis", expression: 3.2 }
        ]

        // 生成随机相关性数据
        const links = []
        const possiblePairs = []

        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                possiblePairs.push({ source: nodes[i].id, target: nodes[j].id })
            }
        }

        // 随机选择一些相关性连接
        const numLinks = Math.min(15, possiblePairs.length)
        const shuffled = possiblePairs.sort(() => 0.5 - Math.random())

        for (let i = 0; i < numLinks; i++) {
            const pair = shuffled[i]
            const correlation = (Math.random() * 1.8) - 0.9 // -0.9 到 0.9
            const strength = Math.abs(correlation)

            if (strength > 0.2) { // 只添加显著相关性
                links.push({
                    source: pair.source,
                    target: pair.target,
                    correlation: correlation,
                    strength: strength,
                    type: correlation > 0 ? "positive" : "negative"
                })
            }
        }

        return { nodes, links }
    }, [data])

    // 根据节点类型获取颜色
    const getNodeColor = (type) => {
        switch(type) {
            case "tumor_suppressor": return "#3b82f6" // blue
            case "oncogene": return "#ef4444" // red
            case "dna_repair": return "#10b981" // green
            case "signaling": return "#f59e0b" // amber
            case "angiogenesis": return "#8b5cf6" // violet
            default: return "#6b7280" // gray
        }
    }

    // 根据相关性类型获取颜色
    const getLinkColor = (type) => {
        switch(type) {
            case "positive": return "#10b981" // green
            case "negative": return "#ef4444" // red
            default: return "#9ca3af" // gray
        }
    }

    // 根据相关性阈值过滤连接
    const filteredLinks = useMemo(() => {
        return graphData.links.filter(link => link.strength >= correlationThreshold)
    }, [graphData.links, correlationThreshold])

    // 初始化D3力导向图
    useEffect(() => {
        if (!svgRef.current || !width || !height) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // 清除现有内容

        // 设置SVG尺寸
        svg.attr("width", width)
            .attr("height", height)

        // 为节点添加初始位置（分布在圆周上）
        const nodesWithInitialPositions = graphData.nodes.map((node, i) => {
          const totalNodes = graphData.nodes.length
          const radius = Math.min(width, height) * 0.3
          const angle = (i / totalNodes) * 2 * Math.PI
          return {
            ...node,
            x: width / 2 + radius * Math.cos(angle),
            y: height / 2 + radius * Math.sin(angle)
          }
        })

        // 创建力仿真，改进参数防止节点重叠
        const simulation = d3.forceSimulation(nodesWithInitialPositions)
            .force("link", d3.forceLink(filteredLinks)
                .id(d => d.id)
                .distance(180)  // 增加连接距离
                .strength(d => d.strength || 0.2))  // 减少连接强度，增加灵活性
            .force("charge", d3.forceManyBody()
                .strength(-600))  // 增加排斥力
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(45))  // 增加碰撞半径
            .force("x", d3.forceX(width / 2).strength(0.05))  // 弱力将节点保持在中心附近
            .force("y", d3.forceY(height / 2).strength(0.05))

        simulationRef.current = simulation

        // 创建连接线
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(filteredLinks)
            .enter()
            .append("line")
            .attr("stroke", d => getLinkColor(d.type))
            .attr("stroke-width", d => d.strength * 5)
            .attr("stroke-opacity", 0.7)
            .style("stroke-dasharray", d => d.type === "negative" ? "5,5" : "none")

        // 创建节点组
        const node = svg.append("g")
            .attr("class", "nodes")
            .selectAll("g")
            .data(nodesWithInitialPositions)
            .enter()
            .append("g")
            .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended))

        // 添加节点圆
        node.append("circle")
            .attr("r", d => Math.max(15, Math.sqrt(d.expression) * 5))
            .attr("fill", d => getNodeColor(d.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleNodeClick)

        // 添加节点标签
        node.append("text")
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .attr("dy", -20)
            .attr("fill", "#1f2937")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")

        // 添加连接标签（显示相关系数）
        const linkLabel = svg.append("g")
            .attr("class", "link-labels")
            .selectAll("text")
            .data(filteredLinks)
            .enter()
            .append("text")
            .attr("text-anchor", "middle")
            .attr("fill", "#4b5563")
            .attr("font-size", "10px")
            .style("pointer-events", "none")
            .text(d => d.correlation.toFixed(2))

        // 更新仿真位置
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y)

            node
                .attr("transform", d => `translate(${d.x},${d.y})`)

            // 更新连接标签位置
            linkLabel
                .attr("x", d => (d.source.x + d.target.x) / 2)
                .attr("y", d => (d.source.y + d.target.y) / 2)
        })

        // 拖拽函数
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
        }

        function dragged(event, d) {
            d.fx = event.x
            d.fy = event.y
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
        }

        // 鼠标事件函数
        function handleMouseOver(event, d) {
            setHoveredNode(d)
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("stroke", "#000")
                .attr("stroke-width", 3)

            // 高亮相关连接
            link
                .attr("stroke-opacity", linkData =>
                    linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0.3
                )
                .attr("stroke-width", linkData =>
                    linkData.source.id === d.id || linkData.target.id === d.id ?
                    linkData.strength * 7 : linkData.strength * 5
                )

            linkLabel
                .attr("opacity", linkData =>
                    linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0.3
                )
        }

        function handleMouseOut(event, d) {
            setHoveredNode(null)
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)

            // 恢复连接样式
            link
                .attr("stroke-opacity", 0.7)
                .attr("stroke-width", d => d.strength * 5)

            linkLabel.attr("opacity", 1)
        }

        function handleNodeClick(event, d) {
            setSelectedNode(d)

            // 高亮所选节点及其连接
            const connectedNodeIds = new Set()
            const connectedLinks = filteredLinks.filter(link =>
                link.source.id === d.id || link.target.id === d.id
            )

            connectedLinks.forEach(link => {
                connectedNodeIds.add(link.source.id)
                connectedNodeIds.add(link.target.id)
            })

            // 更新节点和连接样式
            node.select("circle")
                .attr("opacity", nodeData =>
                    nodeData.id === d.id || connectedNodeIds.has(nodeData.id) ? 1 : 0.3
                )

            link
                .attr("stroke-opacity", linkData =>
                    linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0.2
                )

            linkLabel
                .attr("opacity", linkData =>
                    linkData.source.id === d.id || linkData.target.id === d.id ? 1 : 0.2
                )
        }

        // 清理函数
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop()
            }
        }
    }, [graphData, filteredLinks, width, height])

    // 重置高亮
    const resetHighlight = () => {
        setSelectedNode(null)
        const svg = d3.select(svgRef.current)
        svg.selectAll("circle")
            .attr("opacity", 1)
        svg.selectAll("line")
            .attr("stroke-opacity", 0.7)
            .attr("stroke-width", d => d.strength * 5)
        svg.selectAll(".link-labels text")
            .attr("opacity", 1)
    }

    return (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
            <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    <Box sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}>Node Types</Box>
                    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#3b82f6" }} />
                            <span style={{ fontSize: "12px" }}>Tumor Suppressor</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#ef4444" }} />
                            <span style={{ fontSize: "12px" }}>Oncogene</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#10b981" }} />
                            <span style={{ fontSize: "12px" }}>DNA Repair</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                            <span style={{ fontSize: "12px" }}>Signaling Pathway</span>
                        </Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#8b5cf6" }} />
                            <span style={{ fontSize: "12px" }}>Angiogenesis</span>
                        </Box>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1, alignItems: "flex-end" }}>
                    <Box sx={{ fontSize: "12px", fontWeight: "bold" }}>Correlation Threshold</Box>
                    <input
                        type="range"
                        min="0.1"
                        max="0.9"
                        step="0.1"
                        value={correlationThreshold}
                        onChange={(e) => setCorrelationThreshold(parseFloat(e.target.value))}
                        style={{ width: "150px" }}
                    />
                    <span style={{ fontSize: "12px" }}>{correlationThreshold.toFixed(1)}</span>
                    <button
                        onClick={resetHighlight}
                        style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            backgroundColor: "#2563eb",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            marginTop: "4px"
                        }}
                    >
                        Reset Highlight
                    </button>
                </Box>
            </Box>

            <Box
                ref={containerRef}
                sx={{ height: "100%", width: "100%" }}
            >
                <svg
                    ref={svgRef}
                    style={{ width: "100%", height: "100%" }}
                />
            </Box>

            {(selectedNode || hoveredNode) && (
                <Box sx={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    padding: "8px 12px",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                    zIndex: 10,
                    maxWidth: "300px"
                }}>
                    {selectedNode && (
                        <div>
                            <div><strong>Selected: {selectedNode.name}</strong></div>
                            <div>Type: {selectedNode.type}</div>
                            <div>Expression: {selectedNode.expression}</div>
                            <div>ID: {selectedNode.id}</div>
                        </div>
                    )}
                    {hoveredNode && !selectedNode && (
                        <div>
                            <div><strong>Hovered: {hoveredNode.name}</strong></div>
                            <div>Type: {hoveredNode.type}</div>
                            <div>Expression: {hoveredNode.expression}</div>
                        </div>
                    )}
                    {filteredLinks.length > 0 && selectedNode && (
                        <div style={{ marginTop: "8px" }}>
                            <div style={{ fontWeight: "bold" }}>Related Connections:</div>
                            {filteredLinks
                                .filter(link => link.source.id === selectedNode.id || link.target.id === selectedNode.id)
                                .map((link, index) => (
                                    <div key={index} style={{ fontSize: "11px" }}>
                                        {link.source.id === selectedNode.id ? link.target.id : link.source.id}:
                                        <span style={{ color: getLinkColor(link.type), fontWeight: "bold" }}>
                                            {link.correlation.toFixed(2)}
                                        </span>
                                        ({link.type})
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </Box>
            )}

            <Box sx={{
                position: "absolute",
                bottom: 10,
                right: 10,
                backgroundColor: "rgba(255, 255, 255, 0.9)",
                padding: "8px 12px",
                borderRadius: "4px",
                border: "1px solid #e5e7eb",
                fontSize: "11px",
                zIndex: 10
            }}>
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Legend</div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <div style={{ width: "20px", height: "3px", backgroundColor: "#10b981" }}></div>
                    <span>Positive Correlation</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "20px", height: "3px", backgroundColor: "#ef4444", borderBottom: "1px dashed #ef4444" }}></div>
                    <span>Negative Correlation (dashed)</span>
                </div>
            </Box>
        </Box>
    )
}

// 包装组件
import { fetchCorrelationNetwork } from "@/services/ceRNAApi"

const NodeRelationshipGraphWrapper = ({ data, useApi = true, apiParams = {} }) => {
    const [apiData, setApiData] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const hasLoadedRef = useRef(false)
    const isFetchingRef = useRef(false)
    const lastParamsRef = useRef(JSON.stringify(apiParams))

    // 如果没有提供数据且useApi为true，则从API获取数据
    useEffect(() => {
        // 如果有外部提供的数据，或者禁用了API，则不清除已加载的数据
        if (data || !useApi) {
            // 如果之前有加载数据，但现在提供了外部数据，可以保留apiData作为后备
            return
        }

        // 检查参数是否变化
        const currentParams = JSON.stringify(apiParams)
        const shouldReload = !hasLoadedRef.current || currentParams !== lastParamsRef.current

        // 防止重复加载
        if (!shouldReload || isFetchingRef.current) {
            return
        }

        const loadData = async () => {
            isFetchingRef.current = true
            setLoading(true)
            setError(null)
            try {
                const result = await fetchCorrelationNetwork(apiParams)
                setApiData(result)
                hasLoadedRef.current = true
                lastParamsRef.current = currentParams
            } catch (err) {
                setError(err.message)
                console.error('Failed to fetch correlation network data:', err)
                // 即使失败也标记为已加载，防止重复请求
                hasLoadedRef.current = true
                lastParamsRef.current = currentParams
            } finally {
                setLoading(false)
                isFetchingRef.current = false
            }
        }
        loadData()
    }, [data, useApi, apiParams])

    // 使用提供的data，或者从API获取的data，或者null（内部组件会使用模拟数据）
    const graphData = data || apiData

    return (
        <VisualizationContainer>
            {loading && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    borderRadius: '8px',
                    zIndex: 1000
                }}>
                    Loading correlation network data...
                </div>
            )}
            {error && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    padding: '20px',
                    background: 'rgba(255, 220, 220, 0.9)',
                    borderRadius: '8px',
                    color: '#dc2626',
                    zIndex: 1000
                }}>
                    Error loading data: {error}
                </div>
            )}
            <NodeRelationshipGraph data={graphData} />
        </VisualizationContainer>
    )
}

export default NodeRelationshipGraphWrapper