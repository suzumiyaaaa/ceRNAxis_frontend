import { useEffect, useMemo, useRef, useState } from "react"
import { useContainerSize } from "@/components/common/container/ResponsiveVisualizationContainer"
import * as echarts from "echarts"
import { Box } from "@mui/system"
import VisualizationContainer from "@/components/ui/container/VisualizationContainer"

/**
 * 生成ECharts柱状图配置选项
 * @param {Object} data - 图表数据对象
 * @param {string[]} data.categories - x轴分类数据
 * @param {number[]} data.values - y轴数值数据
 * @returns {Object} ECharts配置对象
 */
const getOptions = (data) => ({
    title: {
        text: "Simple Bar Chart",
        subtext: "bar chart with background color",
        left: "center",
    },
    xAxis: {
        type: "category",
        data: data.categories,
    },
    yAxis: {
        type: "value",
    },
    series: [
        {
            type: "bar",
            data: data.values,
            showBackground: true, // 显示柱状图背景
            backgroundStyle: {
                color: "rgba(180, 180, 180, 0.2)", // 背景颜色
            },
        },
    ],
})

/**
 * SimpleBarChart - 简单柱状图可视化组件
 * 使用ECharts库渲染柱状图，支持响应式容器大小调整
 * 从/mock/SimpleBarChartData.json加载数据
 *
 * @returns {JSX.Element} 柱状图组件
 */
const SimpleBarChart = ({}) => {
    // Refs和状态管理
    const chartBoxRef = useRef(null)          // 图表容器DOM引用
    const chartRef = useRef(null)             // ECharts实例引用
    const { width, height } = useContainerSize() // 容器尺寸hook，用于响应式调整
    const [data, setData] = useState(null)    // 图表数据状态

    /**
     * 计算ECharts配置选项，依赖data状态
     * 当data变化时重新生成配置
     */
    const option = useMemo(() => {
        if (!data) return null

        return getOptions(data)
    }, [data])

    /**
     * 副作用：组件挂载时加载图表数据
     * 从/mock/SimpleBarChartData.json获取JSON数据
     * 使用cancelled标志防止组件卸载后更新状态
     */
    useEffect(() => {
        let cancelled = false

        async function load() {
            try {
                const res = await fetch("/mock/SimpleBarChartData.json")
                const json = await res.json()

                if (!cancelled) {
                    setData(json)
                }
            } catch (e) {
                if (!cancelled) console.error(e)
            }
        }

        void load()
        return () => {
            cancelled = true
        }
    }, [])

    /**
     * 副作用：初始化ECharts实例
     * 在chartBoxRef对应的DOM元素上初始化ECharts图表
     * 组件卸载时清理图表实例，防止内存泄漏
     */
    useEffect(() => {
        if (!chartBoxRef.current) return
        chartRef.current = echarts.init(chartBoxRef.current)

        return () => {
            chartRef.current?.dispose()
            chartRef.current = null
        }
    }, [])

    /**
     * 副作用：当option配置变化时更新图表
     * 使用notMerge:true完全替换配置，lazyUpdate:true延迟更新
     * 更新后调用resize()确保图表正确渲染
     */
    useEffect(() => {
        if (!chartRef.current || !option) return
        chartRef.current.setOption(option, { notMerge: true, lazyUpdate: true })
        chartRef.current.resize()
    }, [option])

    /**
     * 副作用：当容器尺寸变化时调整图表大小
     * 监听width和height变化，调用ECharts的resize()方法
     * 确保图表适配响应式容器
     */
    useEffect(() => {
        if (!chartRef.current) return
        if (!width || !height) return
        chartRef.current.resize()
    }, [width, height])

    return (
        // ECharts图表容器，通过ref绑定到chartBoxRef
        <Box
            ref={chartBoxRef}
            sx={{ height: "100%", width: "100%", padding: "8px 20px" }}
        />
    )
}

/**
 * SimpleBarChartWrapper - 柱状图包装器组件
 * 将SimpleBarChart包裹在VisualizationContainer中，提供统一的样式和布局
 *
 * @returns {JSX.Element} 包装后的柱状图组件
 */
const SimpleBarChartWrapper = ({}) => (
    <VisualizationContainer>
        <SimpleBarChart/>
    </VisualizationContainer>
)

export default SimpleBarChartWrapper
