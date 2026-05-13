/**
 * DatabaseSearch组件 - 数据库搜索组件
 * 提供ceRNA数据库的搜索功能，支持关键词搜索和重置
 */
import { useState } from "react"
import { Box } from "@mui/system"
import { Input, Button, Space, Typography } from "antd"
import { SearchOutlined, ReloadOutlined } from "@ant-design/icons"

const { Search } = Input
const { Text } = Typography

/**
 * 数据库搜索组件
 * @param {Function} onSearch - 搜索回调函数，接收搜索关键词作为参数
 */
const DatabaseSearch = ({ onSearch }) => {
    const [searchValue, setSearchValue] = useState("")

    /**
     * 处理搜索操作
     * 调用父组件传递的搜索回调函数
     */
    const handleSearch = () => {
        onSearch(searchValue)
    }

    /**
     * 处理重置操作
     * 清空搜索框并触发空搜索
     */
    const handleReset = () => {
        setSearchValue("")
        onSearch("")
    }

    /**
     * 处理键盘按键事件
     * @param {KeyboardEvent} e - 键盘事件对象
     */
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch()
        }
    }

    return (
        <Box>
            {/* 标题 */}
            <Text strong style={{ marginBottom: 8, display: 'block' }}>
                Search ceRNA Database
            </Text>

            {/* 搜索区域：搜索框 + 重置按钮 */}
            <Space.Compact style={{ width: '100%' }}>
                <Search
                    placeholder="Search by miRNA, ceRNA, species, database, type, disease, etc..."
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    onSearch={handleSearch}
                    size="large"
                    style={{ width: '100%' }}
                />
                {/* 重置按钮 */}
                <Button
                    icon={<ReloadOutlined />}
                    onClick={handleReset}
                    size="large"
                >
                    Reset
                </Button>
            </Space.Compact>

            {/* 搜索提示 */}
            <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                Tip: Full-text search across all fields. Use spaces to separate multiple keywords.
            </Text>
        </Box>
    )
}

export default DatabaseSearch