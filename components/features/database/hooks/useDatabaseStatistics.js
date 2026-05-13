/**
 * useDatabaseStatistics自定义hook
 * 用于获取数据库统计信息，包括总记录数和最后更新时间
 */
import { useState, useEffect, useCallback } from "react"
import { fetchDatabaseStatistics } from "@/services/databaseApi"

/**
 * 数据库统计信息获取hook
 * @returns {Object} 包含statistics、loading、error和refetch的对象
 *   - statistics: 统计信息对象（totalRecords, lastUpdated）
 *   - loading: 加载状态
 *   - error: 错误信息
 *   - refetch: 重新获取统计信息的函数
 */
const useDatabaseStatistics = () => {
    const [statistics, setStatistics] = useState({
        totalRecords: 0,      // 数据库总记录数
        lastUpdated: "Unknown" // 最后更新时间
    })
    const [loading, setLoading] = useState(false)  // 加载状态
    const [error, setError] = useState(null)       // 错误信息

    /**
     * 获取数据库统计信息的主函数
     * 异步调用API，获取总记录数和最后更新时间
     * @returns {Promise<void>}
     */
    const fetchStats = useCallback(async () => {
        // 开始加载，清除之前的错误
        setLoading(true)
        setError(null)

        try {
            // 调用API服务获取数据库统计信息
            const stats = await fetchDatabaseStatistics()

            // 更新统计信息状态，确保有默认值
            setStatistics({
                totalRecords: stats.totalRecords || 0,      // 总记录数，默认为0
                lastUpdated: stats.lastUpdated || "Unknown" // 最后更新时间，默认为"Unknown"
            })
        } catch (err) {
            // API调用失败：记录错误并设置错误状态
            console.error('Error fetching database statistics:', err)
            setError(err.message || 'Failed to fetch statistics')
            // 保持默认值，不更新statistics状态
        } finally {
            // 无论成功或失败，最终都要结束加载状态
            setLoading(false)
        }
    }, [])  // 空依赖数组：函数只在组件挂载时创建一次

    // 组件挂载时自动获取数据库统计信息
    // 依赖fetchStats函数，由于依赖数组为空，只在挂载时执行一次
    useEffect(() => {
        fetchStats()
    }, [fetchStats])

    // 返回统计信息、状态和重新获取函数供组件使用
    return {
        statistics,            // 统计信息对象（totalRecords, lastUpdated）
        loading,              // 加载状态
        error,                // 错误信息
        refetch: fetchStats   // 重新获取统计信息的函数
    }
}

export default useDatabaseStatistics