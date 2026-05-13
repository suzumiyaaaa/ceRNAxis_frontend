/**
 * DatabaseTable组件 - 数据库表格展示组件
 * 用于显示ceRNA相互作用数据的表格，支持选择、分页、排序、过滤等功能
 */
import { useState } from "react"
import { Table, Tag, Typography, Tooltip } from "antd"
import { Box } from "@mui/system"
import GenesStyledTable from "@/components/ui/table/GenesStyledTable"
import MultiTagList from "@/components/common/tag/MultiTagList"
import { InfoCircleOutlined } from "@ant-design/icons"

const { Text } = Typography

/**
 * 数据库表格组件
 * @param {Array} data - 表格数据源
 * @param {number} total - 数据总数（用于分页）
 * @param {number} page - 当前页码
 * @param {number} pageSize - 每页显示数量
 * @param {Function} onPageChange - 分页变化回调函数
 * @param {Function} onRowSelectionChange - 行选择变化回调函数
 */
const DatabaseTable = ({ data, total, page, pageSize, onPageChange, onRowSelectionChange }) => {
    const [selectedRowKeys, setSelectedRowKeys] = useState([])

    /**
     * 处理行选择变化
     * @param {Array} selectedKeys - 选中的行键值数组
     */
    const handleSelectionChange = (selectedKeys) => {
        setSelectedRowKeys(selectedKeys)
        if (onRowSelectionChange) {
            onRowSelectionChange(selectedKeys)
        }
    }

    // 表格列配置
    const columns = [
        {
            // miRNA列：显示微RNA标识符
            title: 'miRNA',
            dataIndex: 'mirna',
            key: 'mirna',
            width: 150,
            sorter: (a, b) => a.mirna?.localeCompare(b.mirna || '') || 0,
            render: (text) => (
                <Text strong style={{ color: '#1890ff' }}>
                    {text}
                </Text>
            )
        },
        {
            // ceRNA列：显示竞争性内源RNA标识符
            title: 'ceRNA',
            dataIndex: 'cerna',
            key: 'cerna',
            width: 150,
            sorter: (a, b) => a.cerna?.localeCompare(b.cerna || '') || 0,
            render: (text) => (
                <Tooltip title={text}>
                    <Text strong style={{ color: '#722ed1' }}>
                        {text}
                    </Text>
                </Tooltip>
            )
        },
        {
            // Species列：显示物种信息，带帮助图标
            title: (
                <span>
                    Species
                    <Tooltip title="Organism species">
                        <InfoCircleOutlined style={{ marginLeft: 4, color: '#999' }} />
                    </Tooltip>
                </span>
            ),
            dataIndex: 'species',
            key: 'species',
            width: 100,
            render: (text) => {
                let color = 'green'
                if (text === 'Homo sapiens') color = 'green'
                return <Tag color={color}>{text}</Tag>
            }
        },
        {
            // Database列：显示数据来源数据库，支持多标签显示
            title: 'Database',
            dataIndex: 'database',
            key: 'database',
            width: 200,
            render: (text) => <MultiTagList value={text} color="geekblue" />
        },
        {
            // ceRNA Type列：显示ceRNA类型，根据类型设置不同颜色
            title: 'ceRNA Type',
            dataIndex: 'cerna_type',
            key: 'cerna_type',
            width: 180,
            render: (text) => {
                let color = 'default'

                if (text === 'miRNA-lncRNA') {
                    color = 'purple'
                } else if (text === 'miRNA-mRNA') {
                    color = 'green'
                } else if (text && text.includes(';')) {
                    // 处理组合值，如"miRNA-mRNA;miRNA-lncRNA"
                    color = 'orange'
                }

                return (
                    <Tooltip title={text}>
                        <Tag color={color}>{text}</Tag>
                    </Tooltip>
                )
            }
        },
        {
            // Disease列：显示相关疾病，为空时显示"Not specified"
            title: 'Disease',
            dataIndex: 'disease',
            key: 'disease',
            width: 150,
            render: (text) => {
                if (!text || text === '') return <Text type="secondary">Not specified</Text>
                return <Tag color="magenta">{text}</Tag>
            }
        },
        {
            // Binding Score列：显示结合分数，带彩色进度条
            title: 'Binding Score',
            dataIndex: 'binding_score',
            key: 'binding_score',
            width: 130,
            sorter: (a, b) => (a.binding_score || 0) - (b.binding_score || 0),
            render: (text) => {
                // 数据转换：确保为数字类型
                const value = typeof text === 'number' ? text : parseFloat(text) || 0;
                // 显示格式化：保留一位小数
                const displayValue = typeof value === 'number' && !isNaN(value) ? value.toFixed(1) : '0.0';
                // 计算进度条宽度百分比（限制在0-100之间）
                const widthPercent = Math.min(Math.max(value, 0), 100);

                return (
                    <Box>
                        <Text strong>{displayValue}</Text>
                        {/* 进度条容器 */}
                        <Box sx={{ width: '100%', height: 4, backgroundColor: '#f0f0f0', mt: 0.5 }}>
                            {/* 进度条：根据分数值显示不同颜色 */}
                            <Box
                                sx={{
                                    width: `${widthPercent}%`,
                                    height: '100%',
                                    backgroundColor: value > 80 ? '#52c41a' : value > 60 ? '#faad14' : '#f5222d'
                                }}
                            />
                        </Box>
                    </Box>
                )
            }
        },
        {
            // Regulation列：显示调控类型，支持过滤器
            title: 'Regulation',
            dataIndex: 'regulate_type',
            key: 'regulate_type',
            width: 100,
            filters: [
                { text: 'upregulation', value: 'upregulation' },
                { text: 'downregulation', value: 'downregulation' },
                { text: 'unknown', value: 'unknown' }
            ],
            onFilter: (value, record) => record.regulate_type === value,
            render: (text) => {
                let color = 'default'
                if (text === 'upregulation') color = 'green'
                if (text === 'downregulation') color = 'red'
                if (text === 'unknown') color = 'gray'
                return <Tag color={color}>{text}</Tag>
            }
        },
        {
            // Reference列：显示参考文献信息，带tooltip提示
            title: 'Reference',
            dataIndex: 'reference',
            key: 'reference',
            width: 120,
            render: (text) => (
                <Tooltip title={text}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {text}
                    </Text>
                </Tooltip>
            )
        }
    ]

    // 行选择配置
    const rowSelection = {
        selectedRowKeys,
        onChange: handleSelectionChange,
        selections: [
            Table.SELECTION_ALL,
            Table.SELECTION_INVERT,
            Table.SELECTION_NONE
        ]
    }

    // 分页配置
    const pagination = {
        current: page,
        pageSize: pageSize,
        total: total,
        showSizeChanger: true,     // 显示页面大小选择器
        showQuickJumper: true,     // 显示快速跳转
        showTotal: (total, range) =>
            `${range[0]}-${range[1]} of ${total} items`,
        pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
        onChange: onPageChange,        // 页码变化回调
        onShowSizeChange: onPageChange // 页面大小变化回调
    }

    return (
        <Box>
            {/* 顶部信息显示：当前记录数和选中数 */}
            <Box sx={{ mb: 2 }}>
                <Text type="secondary">
                    Showing {data.length} records. {selectedRowKeys.length > 0 &&
                    `${selectedRowKeys.length} selected`}
                </Text>
            </Box>

            {/* 主表格组件 */}
            <GenesStyledTable
                rowKey="id"                  // 行唯一键
                columns={columns}            // 列配置
                dataSource={data}            // 数据源
                rowSelection={rowSelection}  // 行选择配置
                pagination={pagination}      // 分页配置
                scroll={{ x: 1000, y: 500 }} // 滚动区域
                virtual                      // 启用虚拟滚动
                size="middle"                // 表格尺寸
                bordered                     // 显示边框
            />
        </Box>
    )
}

export default DatabaseTable