import { useEffect, useRef, useState, useMemo } from "react"
import { useContainerSize } from "@/components/common/container/ResponsiveVisualizationContainer"
import * as d3 from "d3"
import { Box } from "@mui/system"
import VisualizationContainer from "@/components/ui/container/VisualizationContainer"

// 表达谱热图组件
const ExpressionHeatmap = ({ data }) => {
    const svgRef = useRef(null)
    const containerRef = useRef(null)
    const { width, height } = useContainerSize()
    const [hoveredCell, setHoveredCell] = useState(null)
    const [selectedGene, setSelectedGene] = useState(null)
    const [selectedSample, setSelectedSample] = useState(null)
    const [colorScaleType, setColorScaleType] = useState("diverging") // "diverging" or "sequential"
    const [showDendrogram, setShowDendrogram] = useState(true)

    // 处理数据：如果没有提供数据，使用默认模拟数据
    const heatmapData = useMemo(() => {
        if (data) return data

        // 默认模拟数据：基因表达谱
        const genes = [
            "TP53", "PTEN", "MYC", "EGFR", "KRAS", "BRCA1", "BRCA2",
            "AKT1", "PIK3CA", "VEGFA", "CDK4", "CDK6", "RB1", "NF1",
            "MET", "ERBB2", "FGFR1", "PDGFRA", "KIT", "FLT3"
        ]

        const samples = [
            "Normal_1", "Normal_2", "Normal_3",
            "Tumor_1", "Tumor_2", "Tumor_3", "Tumor_4", "Tumor_5",
            "Metastasis_1", "Metastasis_2", "Metastasis_3"
        ]

        // 生成表达数据
        const expressionData = []
        const minVal = -3, maxVal = 3

        genes.forEach(gene => {
            samples.forEach(sample => {
                let value

                // 根据基因和样本类型生成有意义的模式
                if (sample.startsWith("Normal")) {
                    value = (Math.random() * 2) - 1 // -1 到 1
                } else if (sample.startsWith("Tumor")) {
                    // 某些基因在肿瘤中高表达
                    if (["MYC", "EGFR", "KRAS"].includes(gene)) {
                        value = 1 + Math.random() * 2 // 1 到 3
                    } else if (["TP53", "PTEN"].includes(gene)) {
                        value = -2 + Math.random() * 1 // -2 到 -1
                    } else {
                        value = (Math.random() * 4) - 2 // -2 到 2
                    }
                } else { // Metastasis
                    // 某些基因在转移中异常表达
                    if (["VEGFA", "MET", "ERBB2"].includes(gene)) {
                        value = 1.5 + Math.random() * 1.5 // 1.5 到 3
                    } else {
                        value = (Math.random() * 3) - 1.5 // -1.5 到 1.5
                    }
                }

                // 添加一些噪声
                value += (Math.random() - 0.5) * 0.5

                // 限制范围
                value = Math.max(minVal, Math.min(maxVal, value))

                expressionData.push({
                    gene,
                    sample,
                    value: parseFloat(value.toFixed(2))
                })
            })
        })

        return {
            genes,
            samples,
            expressionData,
            minVal: d3.min(expressionData, d => d.value),
            maxVal: d3.max(expressionData, d => d.value)
        }
    }, [data])

    // 创建颜色比例尺
    const colorScale = useMemo(() => {
        if (colorScaleType === "diverging") {
            // 发散色标：蓝色（低）-> 白色（中）-> 红色（高）
            return d3.scaleDiverging()
                .domain([heatmapData.minVal, 0, heatmapData.maxVal])
                .interpolator(d3.interpolateRdBu)
        } else {
            // 顺序色标：白色 -> 红色
            return d3.scaleSequential()
                .domain([heatmapData.minVal, heatmapData.maxVal])
                .interpolator(d3.interpolateReds)
        }
    }, [heatmapData, colorScaleType])

    // 初始化热图
    useEffect(() => {
        if (!svgRef.current || !width || !height) return

        const svg = d3.select(svgRef.current)
        svg.selectAll("*").remove() // 清除现有内容

        // 设置边距
        const margin = { top: 60, right: 120, bottom: 100, left: 120 }
        const innerWidth = width - margin.left - margin.right
        const innerHeight = height - margin.top - margin.bottom

        // 创建主画布
        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`)

        // 计算热图单元尺寸（未使用，保留用于可能的未来扩展）
        // const cellWidth = innerWidth / heatmapData.samples.length
        // const cellHeight = innerHeight / heatmapData.genes.length

        // 创建x轴比例尺
        const xScale = d3.scaleBand()
            .domain(heatmapData.samples)
            .range([0, innerWidth])
            .padding(0.05)

        // 创建y轴比例尺
        const yScale = d3.scaleBand()
            .domain(heatmapData.genes)
            .range([0, innerHeight])
            .padding(0.05)

        // 创建颜色比例尺（用于图例）
        const legendWidth = 20
        const legendHeight = 200

        // 绘制热图单元
        const cells = g.selectAll(".cell")
            .data(heatmapData.expressionData)
            .enter()
            .append("rect")
            .attr("class", "cell")
            .attr("x", d => xScale(d.sample))
            .attr("y", d => yScale(d.gene))
            .attr("width", xScale.bandwidth())
            .attr("height", yScale.bandwidth())
            .attr("fill", d => colorScale(d.value))
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
            .on("mouseover", handleCellMouseOver)
            .on("mouseout", handleCellMouseOut)
            .on("click", handleCellClick)

        // 添加x轴
        const xAxis = g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("transform", "rotate(-45)")
            .style("text-anchor", "end")
            .attr("font-size", "10px")

        // 添加x轴标签
        g.append("text")
            .attr("class", "x-axis-label")
            .attr("text-anchor", "middle")
            .attr("x", innerWidth / 2)
            .attr("y", innerHeight + 40)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text("Samples")

        // 添加y轴
        const yAxis = g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(yScale))
            .selectAll("text")
            .attr("font-size", "10px")

        // 添加y轴标签
        g.append("text")
            .attr("class", "y-axis-label")
            .attr("text-anchor", "middle")
            .attr("transform", "rotate(-90)")
            .attr("x", -innerHeight / 2)
            .attr("y", -80)
            .attr("font-size", "12px")
            .attr("font-weight", "bold")
            .text("Genes")

        // 添加颜色图例
        const legend = svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${width - margin.right + 30}, ${margin.top})`)

        // 创建图例比例尺
        const legendScale = d3.scaleLinear()
            .domain([heatmapData.minVal, heatmapData.maxVal])
            .range([legendHeight, 0])

        // 创建图例轴
        const legendAxis = d3.axisRight(legendScale)
            .ticks(5)
            .tickFormat(d3.format(".1f"))

        // 绘制图例渐变
        const defs = svg.append("defs")
        const gradient = defs.append("linearGradient")
            .attr("id", "heatmap-gradient")
            .attr("x1", "0%")
            .attr("x2", "0%")
            .attr("y1", "0%")
            .attr("y2", "100%")

        // 添加渐变停止点
        const stops = colorScaleType === "diverging" ?
            [
                { offset: "0%", color: colorScale(heatmapData.maxVal) },
                { offset: "50%", color: colorScale(0) },
                { offset: "100%", color: colorScale(heatmapData.minVal) }
            ] :
            [
                { offset: "0%", color: colorScale(heatmapData.maxVal) },
                { offset: "100%", color: colorScale(heatmapData.minVal) }
            ]

        gradient.selectAll("stop")
            .data(stops)
            .enter()
            .append("stop")
            .attr("offset", d => d.offset)
            .attr("stop-color", d => d.color)

        // 绘制图例矩形
        legend.append("rect")
            .attr("width", legendWidth)
            .attr("height", legendHeight)
            .style("fill", "url(#heatmap-gradient)")
            .attr("stroke", "#ccc")
            .attr("stroke-width", 1)

        // 添加图例轴
        legend.append("g")
            .attr("class", "legend-axis")
            .attr("transform", `translate(${legendWidth}, 0)`)
            .call(legendAxis)
            .selectAll("text")
            .attr("font-size", "10px")

        // 添加图例标题
        legend.append("text")
            .attr("class", "legend-title")
            .attr("text-anchor", "middle")
            .attr("x", legendWidth / 2)
            .attr("y", -10)
            .attr("font-size", "11px")
            .attr("font-weight", "bold")
            .text("Expression Level")

        // 添加标题
        svg.append("text")
            .attr("class", "heatmap-title")
            .attr("text-anchor", "middle")
            .attr("x", width / 2)
            .attr("y", 30)
            .attr("font-size", "16px")
            .attr("font-weight", "bold")
            .text("Gene Expression Heatmap")

        // 鼠标事件函数
        function handleCellMouseOver(event, d) {
            setHoveredCell(d)

            // 高亮当前行和列
            cells
                .attr("stroke-width", cellData =>
                    (cellData.gene === d.gene || cellData.sample === d.sample) ? 2 : 0.5
                )
                .attr("stroke", cellData =>
                    (cellData.gene === d.gene || cellData.sample === d.sample) ? "#000" : "#fff"
                )

            // 高亮当前单元格
            d3.select(event.currentTarget)
                .attr("stroke", "#000")
                .attr("stroke-width", 3)

            // 高亮轴标签
            xAxis.selectAll("text")
                .style("font-weight", textData => textData === d.sample ? "bold" : "normal")
                .style("fill", textData => textData === d.sample ? "#2563eb" : "#000")

            yAxis.selectAll("text")
                .style("font-weight", textData => textData === d.gene ? "bold" : "normal")
                .style("fill", textData => textData === d.gene ? "#2563eb" : "#000")
        }

        function handleCellMouseOut(_, _d) {
            setHoveredCell(null)

            // 恢复样式
            cells
                .attr("stroke-width", 0.5)
                .attr("stroke", "#fff")

            d3.select(event.currentTarget)
                .attr("stroke", "#fff")
                .attr("stroke-width", 0.5)

            // 恢复轴标签
            xAxis.selectAll("text")
                .style("font-weight", "normal")
                .style("fill", "#000")

            yAxis.selectAll("text")
                .style("font-weight", "normal")
                .style("fill", "#000")
        }

        function handleCellClick(_, d) {
            setSelectedGene(d.gene)
            setSelectedSample(d.sample)

            // 高亮所选基因行和样本列
            cells
                .attr("opacity", cellData =>
                    (cellData.gene === d.gene || cellData.sample === d.sample) ? 1 : 0.6
                )
        }
    }, [heatmapData, colorScale, width, height])

    // 重置选择
    const resetSelection = () => {
        setSelectedGene(null)
        setSelectedSample(null)
        setHoveredCell(null)

        const svg = d3.select(svgRef.current)
        svg.selectAll(".cell")
            .attr("opacity", 1)
            .attr("stroke", "#fff")
            .attr("stroke-width", 0.5)
    }

    return (
        <Box sx={{ height: "100%", width: "100%", position: "relative" }}>
            <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <Box>
                        <Box sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}>Color Mapping</Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                            <button
                                onClick={() => setColorScaleType("diverging")}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    backgroundColor: colorScaleType === "diverging" ? "#2563eb" : "#e5e7eb",
                                    color: colorScaleType === "diverging" ? "white" : "#374151",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Diverging Scale
                            </button>
                            <button
                                onClick={() => setColorScaleType("sequential")}
                                style={{
                                    padding: "4px 8px",
                                    fontSize: "11px",
                                    backgroundColor: colorScaleType === "sequential" ? "#2563eb" : "#e5e7eb",
                                    color: colorScaleType === "sequential" ? "white" : "#374151",
                                    border: "none",
                                    borderRadius: "4px",
                                    cursor: "pointer"
                                }}
                            >
                                Sequential Scale
                            </button>
                        </Box>
                    </Box>

                    <Box>
                        <Box sx={{ fontSize: "12px", fontWeight: "bold", mb: 1 }}>Display Options</Box>
                        <label style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11px" }}>
                            <input
                                type="checkbox"
                                checked={showDendrogram}
                                onChange={(e) => setShowDendrogram(e.target.checked)}
                            />
                            Show Dendrogram
                        </label>
                    </Box>

                    <button
                        onClick={resetSelection}
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
                        Reset Selection
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

            {(hoveredCell || selectedGene) && (
                <Box sx={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    padding: "12px 16px",
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb",
                    fontSize: "12px",
                    zIndex: 10,
                    maxWidth: "300px"
                }}>
                    {hoveredCell && (
                        <div>
                            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Hover Information</div>
                            <div><strong>Gene:</strong> {hoveredCell.gene}</div>
                            <div><strong>Sample:</strong> {hoveredCell.sample}</div>
                            <div><strong>Expression:</strong> {hoveredCell.value}</div>
                            <div style={{ display: "flex", alignItems: "center", marginTop: "8px" }}>
                                <div style={{
                                    width: "16px",
                                    height: "16px",
                                    backgroundColor: colorScale(hoveredCell.value),
                                    border: "1px solid #ccc",
                                    marginRight: "8px"
                                }}></div>
                                <span>Color Value</span>
                            </div>
                        </div>
                    )}

                    {selectedGene && selectedSample && !hoveredCell && (
                        <div>
                            <div style={{ fontWeight: "bold", marginBottom: "8px" }}>Selection Information</div>
                            <div><strong>Selected Gene:</strong> {selectedGene}</div>
                            <div><strong>Selected Sample:</strong> {selectedSample}</div>
                            <div><strong>Expression:</strong> {
                                heatmapData.expressionData.find(d =>
                                    d.gene === selectedGene && d.sample === selectedSample
                                )?.value || "N/A"
                            }</div>
                        </div>
                    )}

                    {selectedGene && (
                        <div style={{ marginTop: "12px" }}>
                            <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Gene Expression Summary</div>
                            <div style={{ fontSize: "11px" }}>
                                {selectedGene} expression across {heatmapData.samples.length} samples:
                            </div>
                            <div style={{ fontSize: "11px", marginTop: "4px" }}>
                                Mean: {(
                                    heatmapData.expressionData
                                        .filter(d => d.gene === selectedGene)
                                        .reduce((sum, d) => sum + d.value, 0) /
                                    heatmapData.samples.length
                                ).toFixed(2)}
                            </div>
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
                <div style={{ fontWeight: "bold", marginBottom: "4px" }}>Interaction Guide</div>
                <div style={{ fontSize: "10px" }}>
                    • Hover: View cell details
                </div>
                <div style={{ fontSize: "10px" }}>
                    • Click: Select gene/sample
                </div>
                <div style={{ fontSize: "10px" }}>
                    • Highlight: Show row/column
                </div>
            </Box>
        </Box>
    )
}

// 包装组件
import { fetchExpressionHeatmap } from "@/services/ceRNAApi"

const ExpressionHeatmapWrapper = ({ data, useApi = true, apiParams = {} }) => {
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
                const result = await fetchExpressionHeatmap(apiParams)
                setApiData(result)
                hasLoadedRef.current = true
                lastParamsRef.current = currentParams
            } catch (err) {
                setError(err.message)
                console.error('Failed to fetch expression heatmap data:', err)
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
    const heatmapData = data || apiData

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
                    Loading expression heatmap data...
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
            <ExpressionHeatmap data={heatmapData} />
        </VisualizationContainer>
    )
}

export default ExpressionHeatmapWrapper