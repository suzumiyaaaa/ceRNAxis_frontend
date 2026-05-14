import { useEffect, useMemo, useRef, useState } from "react"
import { useContainerSize } from "@/components/common/container/ResponsiveVisualizationContainer"
import * as echarts from "echarts"
import { Box } from "@mui/system"

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
            showBackground: true,
            backgroundStyle: {
                color: "rgba(180, 180, 180, 0.2)",
            },
        },
    ],
})

const SimpleBarChart = ({}) => {
    const chartBoxRef = useRef(null)
    const chartRef = useRef(null)
    const { width, height } = useContainerSize()
    const [data, setData] = useState(null)

    const option = useMemo(() => {
        if (!data) return null
        return getOptions(data)
    }, [data])

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

    useEffect(() => {
        if (!chartBoxRef.current) return
        chartRef.current = echarts.init(chartBoxRef.current)

        return () => {
            chartRef.current?.dispose()
            chartRef.current = null
        }
    }, [])

    useEffect(() => {
        if (!chartRef.current || !option) return
        chartRef.current.setOption(option, { notMerge: true, lazyUpdate: true })
        chartRef.current.resize()
    }, [option])

    useEffect(() => {
        if (!chartRef.current) return
        if (!width || !height) return
        chartRef.current.resize()
    }, [width, height])

    return (
        <Box
            ref={chartBoxRef}
            sx={{ height: "100%", width: "100%", padding: "8px 20px" }}
        />
    )
}

export default SimpleBarChart
