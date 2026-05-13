import { Alert } from "antd"
import { Box } from "@mui/system"
import Link from "next/link"
import { ReadOutlined } from "@ant-design/icons"

const PublicationAlertInfo = () => (
    <Box component='span' sx={{ fontSize: '16px' }}>
        Please enter publication information
    </Box>
)

const PublicationAlertTitle = () => (
    <Box component='span' sx={{ fontWeight: 'bold', fontSize: '20px' }}>
        Publication:
    </Box>
)

const PublicationAlertIcon = () => (
    <ReadOutlined style={{ fontSize: '30px', color: 'rgb(22, 119, 255)', marginRight: '12px' }} />
)

const PublicationAlert = ({}) => (
    <Alert
        message={<PublicationAlertTitle/>}
        description={<PublicationAlertInfo/>}
        icon={<PublicationAlertIcon/>}
        type='info'
        showIcon
    />
)

export default PublicationAlert
