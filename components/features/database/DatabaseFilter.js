import { useState, useEffect, useRef } from "react"
import { Box, Stack } from "@mui/system"
import { Select, InputNumber, Slider, Button, Typography, Space, Divider, Spin, Input } from "antd"
import { FilterOutlined, ReloadOutlined } from "@ant-design/icons"
import useFilterOptions from "./hooks/useFilterOptions"

const { Option } = Select
const { Title, Text } = Typography

const DatabaseFilter = ({ onFilterChange }) => {
    const [filters, setFilters] = useState({
        mirna: null,
        cerna: null,
        species: null,
        database: null,
        cerna_type: null,
        disease: null,
        regulate_type: null,
        min_binding_score: null,
        max_binding_score: null
    })

    const { options, loading } = useFilterOptions()
    const speciesOptions = options.species
    const databaseOptions = options.databases
    const cernaTypeOptions = options.cerna_types
    const diseaseOptions = options.diseases
    const regulateTypeOptions = options.regulate_types

    const handleFilterChange = (key, value) => {
        console.log('Filter change:', { key, value, currentFilters: filters })

        // 处理空值：空数组、空字符串、null、undefined都转为null
        let normalizedValue = value
        if (Array.isArray(value) && value.length === 0) {
            normalizedValue = null
        } else if (typeof value === 'string' && value.trim() === '') {
            normalizedValue = null
        } else if (value === undefined) {
            normalizedValue = null
        }

        const newFilters = { ...filters, [key]: normalizedValue }

        // 确保结合得分范围的有效性：min <= max
        if (key === 'min_binding_score' || key === 'max_binding_score') {
            // 获取当前的最小值和最大值
            let minValue = key === 'min_binding_score' ? value : newFilters.min_binding_score
            let maxValue = key === 'max_binding_score' ? value : newFilters.max_binding_score

            // 只有当两个值都不是null时才进行交换检查
            if (minValue !== null && maxValue !== null) {
                // 转换值为数字
                const minNum = typeof minValue === 'number' ? minValue : parseFloat(minValue)
                const maxNum = typeof maxValue === 'number' ? maxValue : parseFloat(maxValue)

                // 确保最小值不大于最大值
                if (!isNaN(minNum) && !isNaN(maxNum) && minNum > maxNum) {
                    console.log('Swapping values because min > max:', { minNum, maxNum })
                    // 交换值：确保min <= max
                    newFilters.min_binding_score = Math.min(minNum, maxNum)
                    newFilters.max_binding_score = Math.max(minNum, maxNum)
                }
            }
            // 如果其中一个为null，保持原样，表示无限制
        }

        console.log('Setting new filters:', newFilters)
        setFilters(newFilters)
    }

    const handleSliderChange = ([min, max]) => {
        console.log('Slider changed:', { min, max, currentFilters: filters })
        // Slider直接设置两个值，确保它们有效
        const newFilters = {
            ...filters,
            min_binding_score: min,
            max_binding_score: max
        }
        setFilters(newFilters)
    }

    const handleApplyFilters = () => {
        onFilterChange(filters)
    }

    const handleResetFilters = () => {
        const resetFilters = {
            mirna: null,
            cerna: null,
            species: null,
            database: null,
            cerna_type: null,
            disease: null,
            regulate_type: null,
            min_binding_score: null,
            max_binding_score: null
        }
        setFilters(resetFilters)
        onFilterChange(resetFilters)
    }

    // 当筛选器变化时自动应用（使用防抖）
    const timeoutRef = useRef(null)

    useEffect(() => {
        // 清除之前的定时器
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        // 设置新的定时器
        timeoutRef.current = setTimeout(() => {
            onFilterChange(filters)
        }, 500)

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [filters, onFilterChange])

    return (
        <Box>
            <Title level={5} style={{ marginBottom: 16 }}>
                <FilterOutlined /> Filter Options
            </Title>

            <Spin spinning={loading}>
                <Stack spacing={3}>
                {/* miRNA筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        miRNA Name
                    </Text>
                    <Input
                        placeholder="e.g., hsa-miR-21-5p"
                        value={filters.mirna || ''}
                        onChange={(e) => handleFilterChange('mirna', e.target.value)}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Box>

                {/* ceRNA筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        ceRNA Name
                    </Text>
                    <Input
                        placeholder="e.g., TP53, MALAT1, etc."
                        value={filters.cerna || ''}
                        onChange={(e) => handleFilterChange('cerna', e.target.value)}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Box>

                {/* 物种筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        Species
                    </Text>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select species"
                        value={filters.species}
                        onChange={(value) => handleFilterChange('species', value)}
                        allowClear
                    >
                        {speciesOptions.map(species => (
                            <Option key={species} value={species}>
                                {species}
                            </Option>
                        ))}
                    </Select>
                </Box>

                {/* 数据库筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        Database
                    </Text>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select database(s)"
                        value={filters.database ? (Array.isArray(filters.database) ? filters.database : [filters.database]) : []}
                        onChange={(value) => handleFilterChange('database', value)}
                        allowClear
                        maxTagCount="responsive"
                    >
                        {databaseOptions.map(db => (
                            <Option key={db} value={db}>
                                {db}
                            </Option>
                        ))}
                    </Select>
                </Box>

                {/* ceRNA类型筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        ceRNA Type
                    </Text>
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder="Select ceRNA type(s)"
                        value={filters.cerna_type ? (Array.isArray(filters.cerna_type) ? filters.cerna_type : [filters.cerna_type]) : []}
                        onChange={(value) => handleFilterChange('cerna_type', value)}
                        allowClear
                        maxTagCount="responsive"
                    >
                        {cernaTypeOptions.map(type => (
                            <Option key={type} value={type}>
                                {type}
                            </Option>
                        ))}
                    </Select>
                </Box>

                {/* 疾病筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        Disease
                    </Text>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select disease (optional)"
                        value={filters.disease}
                        onChange={(value) => handleFilterChange('disease', value)}
                        allowClear
                    >
                        {diseaseOptions.map(disease => (
                            <Option key={disease} value={disease}>
                                {disease || 'Not specified'}
                            </Option>
                        ))}
                    </Select>
                </Box>

                {/* 调控类型筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 8, display: 'block' }}>
                        Regulation Type
                    </Text>
                    <Select
                        style={{ width: '100%' }}
                        placeholder="Select regulation type"
                        value={filters.regulate_type}
                        onChange={(value) => handleFilterChange('regulate_type', value)}
                        allowClear
                    >
                        {regulateTypeOptions.map(type => (
                            <Option key={type} value={type}>
                                {type}
                            </Option>
                        ))}
                    </Select>
                </Box>

                <Divider />

                {/* 结合得分筛选 */}
                <Box>
                    <Text strong style={{ marginBottom: 16, display: 'block' }}>
                        Binding Score Range
                    </Text>
                    <Stack spacing={2}>
                        <Space>
                            <InputNumber
                                min={0}
                                max={100}
                                value={filters.min_binding_score}
                                onChange={(value) => handleFilterChange('min_binding_score', value)}
                                placeholder="Min"
                                style={{ width: 120 }}
                            />
                            <Text type="secondary">to</Text>
                            <InputNumber
                                min={0}
                                max={100}
                                value={filters.max_binding_score}
                                onChange={(value) => handleFilterChange('max_binding_score', value)}
                                placeholder="Max"
                                style={{ width: 120 }}
                            />
                        </Space>
                        <Slider
                            range
                            min={0}
                            max={100}
                            value={[
                                filters.min_binding_score || 0,
                                filters.max_binding_score || 100
                            ]}
                            onChange={handleSliderChange}
                        />
                    </Stack>
                </Box>

                {/* 筛选操作按钮 */}
                <Box>
                    <Space>
                        <Button
                            type="primary"
                            icon={<FilterOutlined />}
                            onClick={handleApplyFilters}
                        >
                            Apply Filters
                        </Button>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={handleResetFilters}
                        >
                            Reset All
                        </Button>
                    </Space>
                </Box>
            </Stack>
            </Spin>
        </Box>
    )
}

export default DatabaseFilter