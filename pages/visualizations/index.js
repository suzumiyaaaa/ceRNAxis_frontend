import { useState } from "react"
import { Tabs, Card, Row, Col, Space, Typography, Button, Select } from "antd"
import { Box } from "@mui/system"
import NetworkTopologyGraph from "@/components/features/visualization/NetworkTopologyGraph"
import NodeRelationshipGraph from "@/components/features/visualization/NodeRelationshipGraph"
import ExpressionHeatmap from "@/components/features/visualization/ExpressionHeatmap"
import CeRNAInteractionGraph from "@/components/features/visualization/CeRNAInteractionGraph"
import PathSearchGraph from "@/components/features/visualization/PathSearchGraph"

const { Title, Paragraph, Text } = Typography

const CeRNAVisualizationPage = () => {
    const [activeTab, setActiveTab] = useState("interaction")
    const [loading, setLoading] = useState(false)
    const [selectedGene, setSelectedGene] = useState(null)

    // 模拟数据状态（可以扩展到从API加载）
    const [networkData, setNetworkData] = useState(null)
    const [relationshipData, setRelationshipData] = useState(null)
    const [heatmapData, setHeatmapData] = useState(null)

    // 基因列表（从模拟数据中提取）
    const geneList = [
        { value: "TP53", label: "TP53 (Tumor Suppressor Gene)" },
        { value: "PTEN", label: "PTEN (Tumor Suppressor Gene)" },
        { value: "MYC", label: "MYC (Oncogene)" },
        { value: "EGFR", label: "EGFR (Oncogene)" },
        { value: "KRAS", label: "KRAS (Oncogene)" },
        { value: "BRCA1", label: "BRCA1 (DNA Repair)" },
        { value: "BRCA2", label: "BRCA2 (DNA Repair)" },
        { value: "AKT1", label: "AKT1 (Signaling Pathway)" },
        { value: "PIK3CA", label: "PIK3CA (Signaling Pathway)" },
        { value: "VEGFA", label: "VEGFA (Angiogenesis)" },
        { value: "LINC00152", label: "LINC00152 (lncRNA)" },
        { value: "MALAT1", label: "MALAT1 (lncRNA)" },
        { value: "HOTAIR", label: "HOTAIR (lncRNA)" },
        { value: "miR-21", label: "miR-21 (miRNA)" },
        { value: "miR-34a", label: "miR-34a (miRNA)" },
        { value: "miR-155", label: "miR-155 (miRNA)" }
    ]

    // 选项卡配置
    const tabItems = [
        {
            key: "interaction",
            label: "ceRNA Interaction Network",
            children: <CeRNAInteractionGraph />
        },
        {
            key: "path-search",
            label: "Multi-hop Path Search",
            children: <PathSearchGraph />
        },
        {
            key: "network",
            label: "Network Topology Graph",
            children: <NetworkTopologyGraph data={networkData} />
        },
        {
            key: "relationship",
            label: "Node Relationship Graph",
            children: <NodeRelationshipGraph data={relationshipData} />
        },
        {
            key: "heatmap",
            label: "Expression Heatmap",
            children: <ExpressionHeatmap data={heatmapData} />
        }
    ]

    // 加载示例数据
    const loadSampleData = () => {
        setLoading(true)
        // 模拟API调用
        setTimeout(() => {
            // 实际项目中可以从API加载数据
            // 这里使用组件的默认数据
            setLoading(false)
        }, 1000)
    }

    // 处理基因选择
    const handleGeneChange = (value) => {
        setSelectedGene(value)
        // 这里可以添加联动逻辑，例如高亮所有可视化中的该基因
        // 未来可以扩展为从API获取该基因的详细信息
    }

    // 重置所有可视化
    const resetAllVisualizations = () => {
        setNetworkData(null)
        setRelationshipData(null)
        setHeatmapData(null)
        setSelectedGene(null)
    }

    return (
        <Box sx={{ padding: "24px", maxWidth: "1400px", margin: "0 auto" }}>
            {/* 数据统计 */}
            <Card style={{ marginBottom: "24px" }}>
                <Title level={2}>Data Statistics</Title>
                <Paragraph style={{ marginBottom: "24px" }}>
                    The ceRNA reference database contains <Text strong>8,008,329</Text> records in total, covering{" "}
                    <Text strong>Homo sapiens</Text> species, integrated from <Text strong>7</Text> major databases
                    (miRWalk, RNAInter, miRDB, miRTarBase, NPInter, TargetSCAN, ENCORI), spanning{" "}
                    <Text strong>2</Text> interaction types (miRNA-mRNA and miRNA-lncRNA).
                </Paragraph>

                <Title level={4} >Species statistics</Title>
                <div style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
                    <div className="stat-box">
                        <div className="stat-box-label">Homo sapiens</div>
                        <div className="stat-box-value">8,008,329</div>
                    </div>
                </div>

                <Title level={4} >Database statistics</Title>
                <div style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "32px" }}>
                    {[
                        { name: "miRWalk", count: "6,623,724" },
                        { name: "RNAInter", count: "846,350" },
                        { name: "miRDB_6.0", count: "413,615" },
                        { name: "miRTarBase_9.0", count: "388,188" },
                        { name: "NPInter_4.0", count: "120,479" },
                        { name: "TargetSCAN_8.0", count: "109,249" },
                        { name: "ENCORI", count: "63,698" },
                    ].map(item => (
                        <div className="stat-box" key={item.name}>
                            <div className="stat-box-label">{item.name}</div>
                            <div className="stat-box-value">{item.count}</div>
                        </div>
                    ))}
                </div>

                <Title level={4} >Type statistics</Title>
                <div style={{ display: "flex", justifyContent: "flex-start", flexWrap: "wrap", gap: "12px" }}>
                    {[
                        { name: "miRNA-mRNA", count: "7,831,819" },
                        { name: "miRNA-lncRNA", count: "187,425" },
                    ].map(item => (
                        <div className="stat-box" key={item.name}>
                            <div className="stat-box-label">{item.name}</div>
                            <div className="stat-box-value">{item.count}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* 页面标题和介绍 */}
            <Card style={{ marginBottom: "24px" }}>
                <Title level={2}>ceRNA Interaction Network Stepwise Visualization</Title>
                <Paragraph>
                    This page provides interactive visualization tools for exploring 8+ million ceRNA (competitive endogenous RNA) interaction data from PostgreSQL database. Start by searching for a node, then expand its neighbors stepwise.
                </Paragraph>
                <Paragraph>
                    <Text strong>Core features:</Text> (1) Search nodes by ID/name, (2) View first-degree neighbors with filtering, (3) Expand nodes to show unrendered connections, (4) Real-time interaction with node/edge details.
                </Paragraph>
                <Paragraph>
                    <Text strong>Performance optimized:</Text> Single query response &lt;2 seconds, max 500 nodes rendered, avoiding full 8M data loading.
                </Paragraph>

                <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                    <Col xs={24} md={12}>
                        <Space size="middle" style={{ width: "100%" }}>
                            <Button type="primary" onClick={loadSampleData} loading={loading}>
                                Load Sample Data
                            </Button>
                            <Button onClick={resetAllVisualizations}>
                                Reset All Visualizations
                            </Button>
                            <Button
                                href="https://en.wikipedia.org/wiki/Competitive_endogenous_RNA"
                                target="_blank"
                            >
                                Learn More About ceRNA
                            </Button>
                        </Space>
                    </Col>
                    <Col xs={24} md={12}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <Text strong>Gene Search:</Text>
                            <Select
                                style={{ width: "100%", maxWidth: "300px" }}
                                placeholder="Search or select a gene..."
                                options={geneList}
                                value={selectedGene}
                                onChange={handleGeneChange}
                                showSearch
                                allowClear
                            />
                        </div>
                    </Col>
                </Row>

                {selectedGene && (
                    <Card
                        size="small"
                        style={{ marginTop: "16px", backgroundColor: "#f8fafc" }}
                        title={`Gene Information: ${selectedGene}`}
                    >
                        <Paragraph style={{ fontSize: "12px", marginBottom: "8px" }}>
                            Selected Gene: <Text strong>{selectedGene}</Text>
                        </Paragraph>
                        <Paragraph style={{ fontSize: "12px" }}>
                            This gene may appear in different forms across the three visualizations:
                        </Paragraph>
                        <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li><Text strong>Network Topology Graph:</Text> May appear as an mRNA node or regulation target</li>
                            <li><Text strong>Node Relationship Graph:</Text> Appears as a network node showing correlations with other genes</li>
                            <li><Text strong>Expression Heatmap:</Text> Appears as a row showing expression levels across different samples</li>
                        </ul>
                        <Paragraph style={{ fontSize: "12px", marginTop: "8px" }}>
                            <Text type="secondary">
                                Future versions will support cross-visualization synchronized highlighting and detailed information display.
                            </Text>
                        </Paragraph>
                    </Card>
                )}
            </Card>

            {/* 可视化选项卡 */}
            <Card>
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={tabItems}
                    size="large"
                    tabBarExtraContent={
                        <Text type="secondary" style={{ fontSize: "12px" }}>
                            Click tabs to switch between visualizations
                        </Text>
                    }
                />
            </Card>

            {/* 可视化说明 */}
            <Row gutter={[16, 16]} style={{ marginTop: "24px" }}>
                <Col xs={24} md={12}>
                    <Card title="ceRNA Interaction Network Description" size="small">
                        <Paragraph style={{ fontSize: "12px" }}>
                            <Text strong>Interactive stepwise visualization of 8+ million ceRNA interactions.</Text>
                        </Paragraph>
                        <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li><strong>Search:</strong> Find nodes by ID/name (supports miRNA/mRNA/lncRNA/circRNA)</li>
                            <li><strong>First-degree neighbors:</strong> View direct connections with filtering (species/database/type)</li>
                            <li><strong>Expand nodes:</strong> Click any node to show its unrendered neighbors</li>
                            <li><strong>Node types:</strong> Color-coded (miRNA=blue, mRNA=green, lncRNA=red)</li>
                            <li><strong>Edge styling:</strong> Thickness/color based on binding score, hover for details</li>
                            <li><strong>Performance:</strong> Max 500 nodes, real-time interaction, &lt;2s query response</li>
                            <li><strong>Filtering:</strong> By species, database source, interaction type</li>
                        </ul>
                    </Card>
                </Col>
                <Col xs={24} md={12}>
                    <Card title="Usage Instructions" size="small">
                        <Paragraph style={{ fontSize: "12px" }}>
                            <Text strong>How to explore the ceRNA interaction network:</Text>
                        </Paragraph>
                        <ol style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li>Enter a node ID/name in search box (e.g., &quot;hsa-miR-123&quot;, &quot;PVT1&quot;)</li>
                            <li>Click search result to load its first-degree neighbors</li>
                            <li>Click any node to select it, then click &quot;Expand Node&quot; to show more connections</li>
                            <li>Use filters (species/database/type) to narrow down interactions</li>
                            <li>Hover over edges to see interaction details (correlation, p-value, tissue)</li>
                            <li>Drag nodes to rearrange layout, click &quot;Reset&quot; to clear canvas</li>
                        </ol>
                    </Card>
                </Col>
            </Row>
            <Row gutter={[16, 16]} style={{ marginTop: "16px" }}>
                <Col xs={24} md={8}>
                    <Card title="Network Topology Graph Description" size="small">
                        <Paragraph style={{ fontSize: "12px" }}>
                            <Text strong>Displays the overall topological structure of ceRNA regulatory networks.</Text>
                        </Paragraph>
                        <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li>Nodes represent different RNA molecule types (lncRNA, circRNA, miRNA, mRNA)</li>
                            <li>Edges represent regulatory relationships between molecules (sponge or target)</li>
                            <li>Node size represents expression level</li>
                            <li>Supports dragging, click highlighting, hover for details</li>
                        </ul>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Node Relationship Graph Description" size="small">
                        <Paragraph style={{ fontSize: "12px" }}>
                            <Text strong>Displays correlation networks between genes.</Text>
                        </Paragraph>
                        <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li>Nodes represent genes, colored by functional type</li>
                            <li>Edges represent correlations between genes (positive/negative)</li>
                            <li>Edge thickness represents correlation strength</li>
                            <li>Can adjust correlation threshold via slider</li>
                            <li>Dashed lines indicate negative correlations</li>
                        </ul>
                    </Card>
                </Col>
                <Col xs={24} md={8}>
                    <Card title="Expression Heatmap Description" size="small">
                        <Paragraph style={{ fontSize: "12px" }}>
                            <Text strong>Displays gene expression profiles across different samples.</Text>
                        </Paragraph>
                        <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                            <li>Rows represent genes, columns represent samples</li>
                            <li>Color represents expression level (blue low, red high)</li>
                            <li>Supports both diverging and sequential color mappings</li>
                            <li>Hover to view detailed values</li>
                            <li>Click to select specific genes or samples</li>
                        </ul>
                    </Card>
                </Col>
            </Row>

            {/* 使用说明 */}
            <Card style={{ marginTop: "24px" }} size="small">
                <Title level={4} style={{ fontSize: "16px" }}>Usage Instructions</Title>
                <Row gutter={[16, 8]}>
                    <Col xs={24} sm={12} md={8}>
                        <Card size="small" title="Interactive Operations">
                            <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                                <li><Text strong>Drag:</Text> Drag nodes in network graphs</li>
                                <li><Text strong>Click:</Text> Select nodes/genes/samples</li>
                                <li><Text strong>Hover:</Text> View detailed information</li>
                                <li><Text strong>Scroll wheel:</Text> Zoom (if supported)</li>
                            </ul>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card size="small" title="Data Description">
                            <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                                <li>ceRNA Interaction Network connects to real backend API</li>
                                <li>8+ million interactions from PostgreSQL database</li>
                                <li>Other visualizations use simulated data for reference</li>
                                <li>Supports filtering by species, database, interaction type</li>
                            </ul>
                        </Card>
                    </Col>
                    <Col xs={24} sm={12} md={8}>
                        <Card size="small" title="Technical Notes">
                            <ul style={{ fontSize: "12px", paddingLeft: "20px" }}>
                                <li>ceRNA Interaction: Cytoscape.js for complex networks</li>
                                <li>Other visualizations: D3.js for custom graphics</li>
                                <li>Uses Next.js + React framework</li>
                                <li>Responsive design, adapts to different screens</li>
                                <li>Performance optimized for 8M+ data queries</li>
                            </ul>
                        </Card>
                    </Col>
                </Row>
            </Card>

            {/* 页脚说明 */}
            <Box sx={{ textAlign: "center", marginTop: "32px", padding: "16px", color: "#6b7280" }}>
                <Paragraph style={{ fontSize: "12px" }}>
                    ceRNAxis Visualization Tool v0.1.0 | This tool is for research and educational purposes |
                    <Text code>Data is simulated for reference only</Text>
                </Paragraph>
            </Box>

            <style jsx>{`
                .stat-box {
                    background-color: #f8fafd;
                    border: 1px solid #e2e8f0;
                    border-radius: 10px;
                    padding: 18px 20px;
                    text-align: center;
                    width: 170px;
                    min-height: 90px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    transition: border-color 0.25s, box-shadow 0.25s, transform 0.25s;
                    cursor: default;
                }
                .stat-box:hover {
                    border-color: #3b82f6;
                    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.15);
                    transform: translateY(-2px);
                }
                .stat-box-label {
                    font-size: 13px;
                    color: #64748b;
                    margin-bottom: 6px;
                    word-break: break-word;
                    line-height: 1.3;
                }
                .stat-box-value {
                    font-size: 22px;
                    font-weight: 700;
                    color: #1e3a5f;
                    line-height: 1.2;
                }
            `}</style>
        </Box>
    )
}

export default CeRNAVisualizationPage