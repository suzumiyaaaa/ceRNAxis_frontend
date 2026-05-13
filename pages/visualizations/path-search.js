/**
 * ceRNA 多级通路搜索页面
 * 在两个RNA分子间搜索多跳调控通路并进行可视化
 */
import { Card, Typography, Row, Col, Space, Tag, Divider } from "antd"
import { Box } from "@mui/system"
import { ApartmentOutlined } from "@ant-design/icons"
import dynamic from "next/dynamic"

const PathSearchGraph = dynamic(
  () => import("@/components/features/visualization/PathSearchGraph"),
  { ssr: false }
)

const { Title, Paragraph, Text } = Typography

const PathSearchPage = () => {
  return (
    <Box sx={{ padding: "24px", maxWidth: "1600px", margin: "0 auto" }}>
      {/* 页面标题 */}
      <Card style={{ marginBottom: 16 }}>
        <Space align="start">
          <ApartmentOutlined style={{ fontSize: 28, color: '#3b82f6' }} />
          <Box>
            <Title level={2} style={{ marginBottom: 4 }}>ceRNA Multi-Hop Pathway Search</Title>
            <Paragraph style={{ marginBottom: 0, color: '#6b7280', fontSize: 13 }}>
              Search for multi-hop regulatory pathways between two RNA molecules in the ceRNA network, supporting 1-5 hop depth
            </Paragraph>
          </Box>
        </Space>
      </Card>

      {/* 搜索与可视化 */}
      <Card
        style={{ marginBottom: 16 }}
        styles={{ body: { padding: 0 } }}
      >
        <PathSearchGraph />
      </Card>

      {/* 使用说明 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Features" size="small">
            <ul style={{ fontSize: 12, paddingLeft: 20, lineHeight: 2 }}>
              <li><Text strong>Source/Target RNA:</Text> Enter names or IDs of two RNA molecules with auto-suggestions</li>
              <li><Text strong>Max Hops:</Text> Control search depth (1-5); more hops cover a wider range but take longer</li>
              <li><Text strong>Pathway List:</Text> Right panel shows all pathways found; click to highlight a specific pathway</li>
              <li><Text strong>Layout Switch:</Text> Supports breadthfirst, concentric, force-directed, circle, and grid layouts</li>
              <li><Text strong>Node Filter:</Text> Filter display by miRNA, mRNA, or lncRNA type</li>
              <li><Text strong>Export:</Text> Export the network diagram as PNG or SVG</li>
            </ul>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Node Types" size="small">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tag color="#3b82f6" style={{ width: 70, textAlign: 'center' }}>miRNA</Tag>
                <Text style={{ fontSize: 12 }}>microRNA, small non-coding RNA that regulates gene expression</Text>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tag color="#10b981" style={{ width: 70, textAlign: 'center' }}>mRNA</Tag>
                <Text style={{ fontSize: 12 }}>Messenger RNA, transcription product of protein-coding genes</Text>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Tag color="#ef4444" style={{ width: 70, textAlign: 'center' }}>lncRNA</Tag>
                <Text style={{ fontSize: 12 }}>Long non-coding RNA, acts as ceRNA to competitively bind miRNA</Text>
              </Box>
              <Divider style={{ margin: '4px 0' }} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #f59e0b' }} />
                <Text style={{ fontSize: 12 }}>Source node (gold border)</Text>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #8b5cf6' }} />
                <Text style={{ fontSize: 12 }}>Target node (purple border)</Text>
              </Box>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 搜索示例 */}
      <Card title="Search Examples" size="small" style={{ marginTop: 16 }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ background: '#f8fafc' }}>
              <Text strong style={{ fontSize: 12 }}>miRNA → mRNA</Text>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                Search miRNA-to-target regulatory pathways, typically 1 hop
              </div>
              <Tag color="blue" style={{ marginTop: 4 }}>1 hop</Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ background: '#f8fafc' }}>
              <Text strong style={{ fontSize: 12 }}>lncRNA → mRNA</Text>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                lncRNA indirectly regulates mRNA by sponging miRNA, typically 2-3 hops
              </div>
              <Tag color="orange" style={{ marginTop: 4 }}>2-3 hops</Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ background: '#f8fafc' }}>
              <Text strong style={{ fontSize: 12 }}>lncRNA → lncRNA</Text>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                Two lncRNAs forming a ceRNA network via shared miRNAs, typically 2-4 hops
              </div>
              <Tag color="red" style={{ marginTop: 4 }}>2-4 hops</Tag>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card size="small" style={{ background: '#f8fafc' }}>
              <Text strong style={{ fontSize: 12 }}>mRNA → mRNA</Text>
              <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4 }}>
                Two mRNAs competing for shared miRNAs, typically 2 hops
              </div>
              <Tag color="green" style={{ marginTop: 4 }}>2 hops</Tag>
            </Card>
          </Col>
        </Row>
      </Card>
    </Box>
  )
}

export default PathSearchPage
