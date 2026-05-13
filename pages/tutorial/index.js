import { useState } from "react"
import { Box } from "@mui/system"
import { Menu, Typography } from "antd"

/**
 * 菜单项数据结构
 * 定义教程页面的左侧导航菜单结构，包含分组和子菜单项
 * 结构：
 * - key: 菜单项唯一标识
 * - label: 菜单项显示文本
 * - type: 菜单类型（'group'表示分组）
 * - children: 子菜单项数组
 */
const menuItems = [
  {
    key: 'overview-group',
    label: 'Overview',
    type: 'group',
    children: [
      {
        key: 'introduction',
        label: 'Introduction',
      },
    ],
  },
  {
    key: 'database-group',
    label: 'Database',
    type: 'group',
    children: [
      {
        key: 'database-introduction',
        label: 'Database introduction',
      },
      {
        key: 'database-exploration',
        label: 'Database exploration',
      },
      {
        key: 'database-download',
        label: 'Database download',
      },
    ],
  },
  {
    key: 'visualization-group',
    label: 'Network',
    type: 'group',
    children: [
      {
        key: 'network-topology-diagram',
        label: 'Network Topology Diagram',
      },
      {
        key: 'node-relationship-diagram',
        label: 'Node Relationship Diagram',
      },
      {
        key: 'expression-heatmap',
        label: 'Expression Heatmap',
      },
    ],
  },
]

/**
 * 内容组件映射
 * 将菜单项key映射到对应的教程内容组件
 * 每个组件包含标题和段落文本，使用Ant Design的Typography组件
 */
const contentComponents = {
  'introduction': (
    <div>
      <Typography.Title level={2}>Introduction</Typography.Title>
      <Typography.Paragraph>
        This is the introduction section for the ceRNAxis Visualizations tutorial.
        Here you can find an overview of the platform and its capabilities.
      </Typography.Paragraph>
      <Typography.Paragraph>
        The ceRNAxis Visualizations platform provides interactive tools for exploring
        competing endogenous RNA (ceRNA) networks and gene expression data.
      </Typography.Paragraph>
    </div>
  ),
  'database-introduction': (
    <div>
      <Typography.Title level={2}>Database Introduction</Typography.Title>
      <Typography.Paragraph>
        The ceRNAxis database contains comprehensive data on ceRNA interactions,
        gene expression profiles, and network topology information.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Our database integrates multiple public data sources and provides
        curated datasets for research use.
      </Typography.Paragraph>
    </div>
  ),
  'database-exploration': (
    <div>
      <Typography.Title level={2}>Database Exploration</Typography.Title>
      <Typography.Paragraph>
        Explore the database through our interactive query interface. You can
        search for specific genes, miRNAs, or pathways.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Use the advanced filters to narrow down results based on expression
        levels, tissue types, or statistical significance.
      </Typography.Paragraph>
    </div>
  ),
  'database-download': (
    <div>
      <Typography.Title level={2}>Database Download</Typography.Title>
      <Typography.Paragraph>
        Download datasets in various formats including CSV, JSON, and TSV.
        All data is available for non-commercial research use.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Please cite our publication when using downloaded data in your research.
      </Typography.Paragraph>
    </div>
  ),
  'network-topology-diagram': (
    <div>
      <Typography.Title level={2}>Network Topology Diagram</Typography.Title>
      <Typography.Paragraph>
        The Network Topology Diagram visualizes the structure of ceRNA networks,
        showing connections between genes, miRNAs, and other regulatory elements.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Interactive features allow you to zoom, pan, and click on nodes for
        detailed information.
      </Typography.Paragraph>
    </div>
  ),
  'node-relationship-diagram': (
    <div>
      <Typography.Title level={2}>Node Relationship Diagram</Typography.Title>
      <Typography.Paragraph>
        The Node Relationship Diagram focuses on specific interactions between
        network components, highlighting regulatory relationships.
      </Typography.Paragraph>
      <Typography.Paragraph>
        This visualization helps identify key regulators and potential therapeutic
        targets in ceRNA networks.
      </Typography.Paragraph>
    </div>
  ),
  'expression-heatmap': (
    <div>
      <Typography.Title level={2}>Expression Heatmap</Typography.Title>
      <Typography.Paragraph>
        The Expression Heatmap displays gene expression patterns across different
        conditions, tissues, or time points.
      </Typography.Paragraph>
      <Typography.Paragraph>
        Color gradients represent expression levels, allowing for quick
        identification of co-expressed genes and regulatory patterns.
      </Typography.Paragraph>
    </div>
  ),
}

/**
 * Tutorial - 教程页面组件
 * 提供ceRNAxis可视化平台的教程文档，包括左侧导航菜单和右侧内容区域
 * 用户可以通过左侧菜单选择不同的教程主题，右侧显示对应的教学内容
 *
 * @returns {JSX.Element} 教程页面组件
 */
const Tutorial = () => {
  // 当前选中的教程菜单项key，默认为'introduction'
  const [selectedKey, setSelectedKey] = useState('introduction')

  /**
   * 处理菜单点击事件
   * @param {Object} e - 菜单点击事件对象
   * @param {string} e.key - 被点击的菜单项key
   */
  const handleMenuClick = (e) => {
    setSelectedKey(e.key)
  }

  /**
   * 格式化菜单项数据，转换为Ant Design Menu组件需要的格式
   * 为分组标题添加样式（黑色、粗体、14px字体）
   */
  const menuItemsFormatted = menuItems.map(group => ({
    key: group.key,
    label: (
      <span style={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
        {group.label}
      </span>
    ),
    type: group.type,
    children: group.children.map(item => ({
      key: item.key,
      label: item.label,
    })),
  }))

  return (
    // 主容器：设置垂直flex布局，最小高度为视口高度减去页眉页脚
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 128px)' }}>
      {/* 内容区域：水平flex布局，包含左侧菜单和右侧教程内容 */}
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* 左侧菜单面板：固定宽度，白色背景，带阴影和边框 */}
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            backgroundColor: '#fff',
            borderRight: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '8px 0 0 8px',
            overflowY: 'auto',
            position: 'sticky',
            top: 64,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 128px)',
          }}
        >
          {/* Ant Design 垂直菜单组件 */}
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]} // 当前选中的菜单项
            onClick={handleMenuClick}   // 点击菜单项时的处理函数
            style={{
              borderRight: 0,
              padding: '12px 8px'
            }}
            items={menuItemsFormatted}  // 菜单项数据
          />
        </Box>
        {/* 右侧内容区域：占据剩余空间，带垂直滚动 */}
        <Box sx={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
          {/* 教程内容卡片：白色背景，圆角，阴影 */}
          <Box sx={{
            padding: '28px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
            minHeight: 'calc(100vh - 240px)'
          }}>
            {/* 条件渲染：根据selectedKey显示对应的教程内容，如果没有选中则显示提示 */}
            {contentComponents[selectedKey] || (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px'
              }}>
                <Typography.Text type="secondary">
                  Select a tutorial topic from the left menu to get started.
                </Typography.Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Tutorial