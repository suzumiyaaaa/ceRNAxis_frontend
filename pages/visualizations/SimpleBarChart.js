import dynamic from "next/dynamic"
import VisualizationContainer from "@/components/ui/container/VisualizationContainer"

const SimpleBarChart = dynamic(
  () => import("@/components/features/visualization/SimpleBarChart"),
  { ssr: false }
)

const SimpleBarChartWrapper = ({}) => (
    <VisualizationContainer>
        <SimpleBarChart/>
    </VisualizationContainer>
)

export default SimpleBarChartWrapper
