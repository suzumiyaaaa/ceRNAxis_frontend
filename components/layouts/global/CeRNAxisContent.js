import { Layout } from "antd"
import { Box } from "@mui/system"

const CeRNAxisContent = ({ children }) => (
    <Layout.Content
        style={{
            backgroundColor: 'rgba(255, 255, 255, 0.90)',
            minHeight: '100vh',
        }}
    >
        <Box sx={{ px: '80px' }}>
            {children}
        </Box>
    </Layout.Content>
)

export default CeRNAxisContent
