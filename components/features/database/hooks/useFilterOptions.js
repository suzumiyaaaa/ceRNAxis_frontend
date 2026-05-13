/**
 * useFilterOptions自定义hook
 * 用于获取数据库筛选选项，包括物种、数据库、ceRNA类型、疾病和调控类型等
 */
import { useState, useEffect, useCallback } from "react"
import { fetchFilterOptions } from "@/services/databaseApi"

/**
 * 筛选选项获取hook
 * @returns {Object} 包含options、loading、error和refetch的对象
 *   - options: 各筛选字段的选项数组
 *   - loading: 加载状态
 *   - error: 错误信息
 *   - refetch: 重新获取选项的函数
 */
const useFilterOptions = () => {
    const [options, setOptions] = useState({
        species: [],         // 物种选项数组
        databases: [],       // 数据库来源选项数组
        cerna_types: [],     // ceRNA类型选项数组
        diseases: [],        // 疾病选项数组
        regulate_types: []   // 调控类型选项数组
    })
    const [loading, setLoading] = useState(false)  // 加载状态
    const [error, setError] = useState(null)       // 错误信息

    /**
     * 获取筛选选项的主函数
     * 异步调用API，获取各筛选字段的可选值列表
     * @returns {Promise<void>}
     */
    const fetchOptions = useCallback(async () => {
        // 开始加载，清除之前的错误
        setLoading(true)
        setError(null)

        try {
            // 调用API服务获取筛选选项
            const filterOptions = await fetchFilterOptions()

            // 更新选项状态，确保每个字段都有数组（即使API返回空或undefined）
            setOptions({
                species: filterOptions.species || [],
                databases: filterOptions.databases || [],
                cerna_types: filterOptions.cerna_types || [],
                diseases: filterOptions.diseases || [],
                regulate_types: filterOptions.regulate_types || []
            })
        } catch (err) {
            // API调用失败：记录错误并设置错误状态
            console.error('Error fetching filter options:', err)
            setError(err.message || 'Failed to fetch filter options')
            // 保持默认的空数组，不更新options状态
        } finally {
            // 无论成功或失败，最终都要结束加载状态
            setLoading(false)
        }
    }, [])  // 空依赖数组：函数只在组件挂载时创建一次

    // 组件挂载时自动获取筛选选项
    // 依赖fetchOptions函数，由于依赖数组为空，只在挂载时执行一次
    useEffect(() => {
        fetchOptions()
    }, [fetchOptions])

    // 返回选项数据、状态和重新获取函数供组件使用
    return {
        options,            // 各筛选字段的选项数组
        loading,            // 加载状态
        error,              // 错误信息
        refetch: fetchOptions  // 重新获取选项的函数
    }
}

export default useFilterOptions