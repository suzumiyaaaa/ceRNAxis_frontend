import { useEffect, useRef, useState, useMemo } from "react"
import { useContainerSize } from "@/components/common/container/ResponsiveVisualizationContainer"
import * as d3 from "d3"
import { Box } from "@mui/system"
import VisualizationContainer from "@/components/ui/container/VisualizationContainer"

// Network Topology Graph Component
const NetworkTopologyGraph = ({ data }) => {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const { width, height } = useContainerSize()
    const [selectedNode, setSelectedNode] = useState(null)
    const [hoveredNode, setHoveredNode] = useState(null)
    const simulationRef = useRef(null)

    // Process data: if no data is provided, use default simulated data
    const graphData = useMemo(() => {
        if (data) return data

        // Default simulated data: ceRNA-miRNA-mRNA regulatory network
        const nodes = [
            { id: "lncRNA1", type: "lncRNA", name: "LINC00152", expression: 2.5 },
            { id: "lncRNA2", type: "lncRNA", name: "MALAT1", expression: 3.2 },
            { id: "lncRNA3", type: "lncRNA", name: "HOTAIR", expression: 1.8 },
            { id: "circRNA1", type: "circRNA", name: "hsa_circ_0001946", expression: 4.1 },
            { id: "circRNA2", type: "circRNA", name: "hsa_circ_0001430", expression: 2.9 },
            { id: "miRNA1", type: "miRNA", name: "miR-21", expression: 5.0 },
            { id: "miRNA2", type: "miRNA", name: "miR-34a", expression: 3.7 },
            { id: "miRNA3", type: "miRNA", name: "miR-155", expression: 4.3 },
            { id: "mRNA1", type: "mRNA", name: "TP53", expression: 2.1 },
            { id: "mRNA2", type: "mRNA", name: "PTEN", expression: 3.5 },
            { id: "mRNA3", type: "mRNA", name: "MYC", expression: 4.8 },
            { id: "mRNA4", type: "mRNA", name: "EGFR", expression: 3.9 }
        ]

        const links = [
            { source: "lncRNA1", target: "miRNA1", type: "sponge", strength: 0.8 },
            { source: "lncRNA1", target: "miRNA2", type: "sponge", strength: 0.6 },
            { source: "lncRNA2", target: "miRNA1", type: "sponge", strength: 0.7 },
            { source: "lncRNA3", target: "miRNA3", type: "sponge", strength: 0.9 },
            { source: "circRNA1", target: "miRNA2", type: "sponge", strength: 0.5 },
            { source: "circRNA2", target: "miRNA3", type: "sponge", strength: 0.7 },
            { source: "miRNA1", target: "mRNA1", type: "target", strength: 0.9 },
            { source: "miRNA1", target: "mRNA2", type: "target", strength: 0.8 },
            { source: "miRNA2", target: "mRNA3", type: "target", strength: 0.7 },
            { source: "miRNA3", target: "mRNA4", type: "target", strength: 0.6 },
            { source: "miRNA3", target: "mRNA1", type: "target", strength: 0.5 }
        ]

        return { nodes, links }
    }, [data])

    // Get color based on node type
    const getNodeColor = (type) => {
        switch(type) {
            case "lncRNA": return "#4f46e5" // indigo
            case "circRNA": return "#059669" // emerald
            case "miRNA": return "#dc2626" // red
            case "mRNA": return "#f59e0b" // amber
            default: return "#6b7280" // gray
        }
    }

    // Get color based on link type
    const getLinkColor = (type) => {
        switch(type) {
            case "sponge": return "#8b5cf6" // violet
            case "target": return "#10b981" // green
            default: return "#9ca3af" // gray
        }
    }

    // Initialize D3 force-directed graph
    useEffect(() => {
        if (!svgRef.current || !width || !height) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // Clear existing content

        // Set SVG dimensions
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

        // Create force simulation with improved parameters to prevent overlap
        const simulation = d3.forceSimulation(nodesWithInitialPositions)
            .force("link", d3.forceLink(graphData.links)
                .id(d => d.id)
                .distance(150)  // Increased link distance
                .strength(d => d.strength || 0.3))  // Reduced link strength for more flexibility
            .force("charge", d3.forceManyBody()
                .strength(-500))  // Increased repulsive force
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collision", d3.forceCollide().radius(40))  // Increased collision radius
            .force("x", d3.forceX(width / 2).strength(0.05))  // Weak force to keep nodes near center
            .force("y", d3.forceY(height / 2).strength(0.05))

        simulationRef.current = simulation

        // Create links
        const link = svg.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(graphData.links)
            .enter()
            .append("line")
            .attr("stroke", d => getLinkColor(d.type))
            .attr("stroke-width", d => (d.strength || 0.5) * 3)
            .attr("stroke-opacity", 0.6)
            .attr("marker-end", "url(#arrow)")

        // Create node groups
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

        // Add node circles
        node.append("circle")
            .attr("r", d => Math.max(15, Math.sqrt(d.expression) * 6))
            .attr("fill", d => getNodeColor(d.type))
            .attr("stroke", "#fff")
            .attr("stroke-width", 2)
            .on("mouseover", handleMouseOver)
            .on("mouseout", handleMouseOut)
            .on("click", handleNodeClick)

        // Add node labels
        node.append("text")
            .text(d => d.name)
            .attr("text-anchor", "middle")
            .attr("dy", -20)
            .attr("fill", "#1f2937")
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .style("pointer-events", "none")

        // Add arrow marker for directed links
        svg.append("defs").append("marker")
            .attr("id", "arrow")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", 0)
            .attr("markerWidth", 6)
            .attr("markerHeight", 6)
            .attr("orient", "auto")
            .append("path")
            .attr("d", "M0,-5L10,0L0,5")
            .attr("fill", "#9ca3af")

        // Update simulation positions
        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y)

            node
                .attr("transform", d => `translate(${d.x},${d.y})`)
        })

        // Drag functions
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

        // Mouse event functions
        function handleMouseOver(event, d) {
            setHoveredNode(d)
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("stroke", "#000")
                .attr("stroke-width", 3)
        }

        function handleMouseOut(event, d) {
            setHoveredNode(null)
            d3.select(event.currentTarget)
                .transition()
                .duration(200)
                .attr("stroke", "#fff")
                .attr("stroke-width", 2)
        }

        function handleNodeClick(event, d) {
            setSelectedNode(d)

            // 高亮所选节点及其连接
            const connectedNodeIds = new Set()
            const connectedLinks = graphData.links.filter(link =>
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
        }

        // 清理函数
        return () => {
            if (simulationRef.current) {
                simulationRef.current.stop()
            }
        }
    }, [graphData, width, height])

    // 重置高亮
    const resetHighlight = () => {
        setSelectedNode(null)
        const svg = d3.select(svgRef.current)
        svg.selectAll("circle")
            .attr("opacity", 1)
        svg.selectAll("line")
            .attr("stroke-opacity", 0.6)
    }

    return (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
            <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#4f46e5" }} />
                        <span style={{ fontSize: "12px" }}>lncRNA</span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#059669" }} />
                        <span style={{ fontSize: "12px" }}>circRNA</span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#dc2626" }} />
                        <span style={{ fontSize: "12px" }}>miRNA</span>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: "50%", bgcolor: "#f59e0b" }} />
                        <span style={{ fontSize: "12px" }}>mRNA</span>
                    </Box>
                </Box>
            </Box>

            <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 10 }}>
                <button
                    onClick={resetHighlight}
                    style={{
                        padding: "4px 8px",
                        fontSize: "12px",
                        backgroundColor: "#2563eb",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer"
                    }}
                >
                    Reset Highlight
                </button>
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
                    zIndex: 10
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
                </Box>
            )}
        </Box>
    )
}

// 包装组件
import { fetchNetworkTopology } from "@/services/ceRNAApi"

const NetworkTopologyGraphWrapper = ({ data, useApi = true, apiParams = {} }) => {
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
                const result = await fetchNetworkTopology(apiParams)
                setApiData(result)
                hasLoadedRef.current = true
                lastParamsRef.current = currentParams
            } catch (err) {
                setError(err.message)
                console.error('Failed to fetch network topology data:', err)
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
                    Loading network topology data...
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
            <NetworkTopologyGraph data={graphData} />
        </VisualizationContainer>
    )
}

export default NetworkTopologyGraphWrapper