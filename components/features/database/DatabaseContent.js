/**
 * DatabaseContent组件 - 数据库主内容组件
 * 整合搜索、筛选、表格展示和下载功能，管理数据库页面的所有状态和逻辑
 */
import { useState, useEffect, useCallback } from "react"
import { Box, Stack } from "@mui/system"
import { Typography, Card, Spin, Alert } from "antd"
import DatabaseSearch from "./DatabaseSearch"             // 搜索组件
import DatabaseFilter from "./DatabaseFilter"             // 筛选组件
import DatabaseTable from "./DatabaseTable"               // 表格展示组件
import DatabaseDownload from "./DatabaseDownload"         // 下载组件
import useDatabaseData from "./hooks/useDatabaseData"     // 数据获取hook
import useDatabaseStatistics from "./hooks/useDatabaseStatistics"  // 统计信息hook

const { Title } = Typography

/**
 * 数据库主内容组件
 * 管理数据库页面的所有状态和交互逻辑
 */
const DatabaseContent = () => {
    // 搜索查询关键词
    const [searchQuery, setSearchQuery] = useState("")
    // 筛选条件对象
    const [filters, setFilters] = useState({})
    // 当前页码（从1开始）
    const [page, setPage] = useState(1)
    // 每页显示记录数
    const [pageSize, setPageSize] = useState(500)
    // 选中的行键值数组
    const [selectedRows, setSelectedRows] = useState([])

    // 调试：跟踪page状态变化（开发阶段使用）
    useEffect(() => {
        console.log('Page state changed to:', page)
    }, [page])

    /**
     * 使用自定义hook获取数据库数据
     * 根据搜索、筛选和分页参数获取对应的数据
     */
    const { data, loading, error, total } = useDatabaseData({
        search: searchQuery,
        filters,
        page,
        pageSize
    })

    /**
     * 使用自定义hook获取数据库统计信息
     * 包括总记录数和最后更新时间
     */
    const { statistics: dbStats, loading: statsLoading } = useDatabaseStatistics()

    /**
     * 处理搜索操作
     * @param {string} query - 搜索关键词
     */
    const handleSearch = useCallback((query) => {
        console.log('handleSearch called with query:', query)
        setSearchQuery(query)
        setPage(1) // 重置到第一页（新搜索从第一页开始）
    }, [])

    /**
     * 处理筛选条件变化
     * @param {Object} newFilters - 新的筛选条件对象
     */
    const handleFilterChange = useCallback((newFilters) => {
        console.log('handleFilterChange called with filters:', newFilters)
        setFilters(newFilters)
        setPage(1) // 重置到第一页（新筛选从第一页开始）
    }, [])

    /**
     * 处理分页变化
     * @param {number} newPage - 新的页码
     * @param {number} newPageSize - 新的每页记录数
     */
    const handlePageChange = useCallback((newPage, newPageSize) => {
        console.log('handlePageChange called:', { newPage, newPageSize })
        setPage(newPage)
        setPageSize(newPageSize)
    }, [])

    /**
     * 处理表格行选择变化
     * @param {Array} selectedRowKeys - 选中的行键值数组
     */
    const handleRowSelectionChange = (selectedRowKeys) => {
        setSelectedRows(selectedRowKeys)
    }

    return (
        // 主容器：垂直内边距
        <Box sx={{ py: 4 }}>
            {/* 垂直堆叠布局，组件间距为4 */}
            <Stack spacing={4}>
                {/* 页面标题 */}
                <Box>
                    <Title level={2}>ceRNAxis Database</Title>
                    <Typography.Text type="secondary">
                        Browse and explore the comprehensive ceRNA interaction database
                    </Typography.Text>
                </Box>

                {/* 错误提示 */}
                {error && (
                    <Alert
                        message="Error"
                        description={error}
                        type="error"
                        showIcon
                        closable
                    />
                )}

                {/* 搜索和筛选卡片 */}
                <Card title="Search & Filter" bordered={false}>
                    <Stack spacing={3}>
                        <DatabaseSearch onSearch={handleSearch} />
                        <DatabaseFilter onFilterChange={handleFilterChange} />
                    </Stack>
                </Card>

                {/* 数据表格和下载卡片 */}
                <Card
                    title="Database Records"
                    bordered={false}
                    extra={<DatabaseDownload data={data} selectedRows={selectedRows} />}
                >
                    <Spin spinning={loading}>
                        <DatabaseTable
                            data={data}
                            total={total}
                            page={page}
                            pageSize={pageSize}
                            onPageChange={handlePageChange}
                            onRowSelectionChange={handleRowSelectionChange}
                        />
                    </Spin>
                </Card>

                {/* 统计信息 */}
                <Card title="Database Statistics" bordered={false}>
                    <Spin spinning={statsLoading}>
                        <Stack direction="row" spacing={4} alignItems="center">
                            <Box>
                                <Typography.Text strong>Total Records:</Typography.Text>
                                <Typography.Title level={3} style={{ margin: 0 }}>
                                    {dbStats.totalRecords?.toLocaleString() || "0"}
                                </Typography.Title>
                            </Box>
                            <Box>
                                <Typography.Text strong>Last Updated:</Typography.Text>
                                <Typography.Title level={3} style={{ margin: 0 }}>{dbStats.lastUpdated}</Typography.Title>
                            </Box>
                        </Stack>
                    </Spin>
                </Card>
            </Stack>
        </Box>
    )
}

export default DatabaseContent