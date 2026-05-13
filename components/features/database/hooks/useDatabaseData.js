/**
 * useDatabaseData自定义hook
 * 用于获取和过滤ceRNA数据库记录，支持搜索、筛选和分页
 */
import { useState, useEffect, useCallback } from "react"
import { fetchDatabaseRecords } from "@/services/databaseApi"

// 模拟数据库数据（保留作为后备参考）
// const mockDatabaseData = Array.from({ length: 100 }, (_, index) => ({
//     id: index + 1,
//     geneSymbol: `GENE${String(index + 1).padStart(3, '0')}`,
//     geneName: `Gene Name ${index + 1}`,
//     species: index % 3 === 0 ? 'Human' : index % 3 === 1 ? 'Mouse' : 'Rat',
//     tissue: ['Liver', 'Brain', 'Heart', 'Kidney', 'Lung'][index % 5],
//     expressionLevel: Math.random() * 100,
//     interactionCount: Math.floor(Math.random() * 50),
//     databaseSource: ['NCBI', 'Ensembl', 'UCSC'][index % 3],
//     publicationCount: Math.floor(Math.random() * 20),
//     lastUpdated: `2024-0${(index % 9) + 1}-${String((index % 28) + 1).padStart(2, '0')}`
// }))

/**
 * 数据库数据获取hook
 * @param {string} search - 搜索关键词，用于全文搜索
 * @param {Object} filters - 筛选条件对象
 * @param {number} page - 当前页码（从1开始）
 * @param {number} pageSize - 每页显示记录数
 * @returns {Object} 包含data、loading、error、total和refetch的对象
 */
const useDatabaseData = ({ search, filters, page, pageSize }) => {
    const [data, setData] = useState([])      // 数据库记录数据数组
    const [loading, setLoading] = useState(false)  // 加载状态
    const [error, setError] = useState(null)       // 错误信息
    const [total, setTotal] = useState(0)          // 数据总数（用于分页）

    /**
     * 获取数据库数据的主函数
     * 异步调用API，处理加载状态、错误处理和数据更新
     * @returns {Promise<void>}
     */
    const fetchData = useCallback(async () => {
        // 开始加载，清除之前的错误
        setLoading(true)
        setError(null)

        try {
            // 调用API服务获取数据库记录
            // 传递搜索关键词、筛选条件、分页参数
            const result = await fetchDatabaseRecords({
                search,      // 搜索关键词
                filters,     // 筛选条件对象
                page,        // 页码（从1开始）
                pageSize     // 每页记录数
            })

            // 成功获取数据后，更新状态
            // 调试日志：显示获取的数据信息
            console.log('useDatabaseData: setting data and total', {
                dataLength: result.data.length,
                total: result.total,
                page: page,
                pageSize: pageSize
            })
            // 设置数据数组和总数（用于分页）
            setData(result.data)
            setTotal(result.total)
        } catch (err) {
            // API调用失败：记录错误并设置错误状态
            console.error('Error fetching database data:', err)
            setError(err.message || 'Failed to fetch data from server')
            // 错误时清空数据，防止显示过时的数据
            setData([])
            setTotal(0)
        } finally {
            // 无论成功或失败，最终都要结束加载状态
            setLoading(false)
        }
    }, [search, filters, page, pageSize])  // 依赖项：当这些参数变化时重新创建函数

    // 监听fetchData函数的变化，当搜索、筛选或分页参数变化时重新获取数据
    useEffect(() => {
        fetchData()
    }, [fetchData])

    // 返回数据、状态和重新获取函数供组件使用
    return { data, loading, error, total, refetch: fetchData }
}

export default useDatabaseData