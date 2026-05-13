import { Tooltip } from "antd"
import { Box } from "@mui/system"

//鼠标悬停在图标上提示内容
const TooltipIcon = ({ icon, tooltipContent }) => (
    <Tooltip title={tooltipContent}>
        <Box component="span">
            {icon}
        </Box>
    </Tooltip>
)

export default TooltipIcon
