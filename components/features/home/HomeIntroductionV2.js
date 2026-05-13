import { Box, Grid, Stack } from "@mui/system"
import {
    BarChartOutlined,
    FileSearchOutlined,
    FileTextOutlined,
    ProfileOutlined,
    SendOutlined
} from "@ant-design/icons"
import { Button } from "antd"
import DatabaseIcon from "@/components/icons/Database"

const HomeIntroduction = ({  }) => (
    <Grid
        container
        spacing={2}
        sx={{
            padding: '32px 0px',
            display: 'flex',
            alignItems: 'center',
        }}
    >
        <Grid size={4.5} offset={0.5}>
            <Stack spacing={3}>
                <Stack spacing={2}>
                    <Box component='h6' sx={{fontSize: '40px', fontWeight: 'bold', paddingBottom: '12px'}}>
                        Explore ceRNA Interactions with {' '}
                        <Box component='span' sx={{ color: '#2978ef', fontWeight: 'bold' }}>ceRNAxis</Box>
                    </Box>
                    <Box component='h6' sx={{fontSize: '20px', paddingBottom: '12px', fontWeight: '400', lineHeight: '1.5'}}>
                        ceRNA Database curates and functionally annotates over <strong>1,345,678</strong> ceRNA interactions and <strong>2,345,432</strong> metadata
                         from <strong>512</strong> datasets, <strong>98,654</strong> samples, <strong>1,234,567</strong> tissues, and <strong>345,678</strong> individual cells, spanning <strong>56</strong> RNA-related
                          diseases and <strong>12</strong> cancer types from <strong>6</strong> major data sources and <strong>35</strong> research initiatives and institutions.
                    </Box>
                </Stack>
                <Stack direction="row" spacing={2}>
                    <Button
                        href='/database'
                        size='large'
                        icon={<DatabaseIcon/>}
                        style={{ backgroundColor: '#1ba7df', color: 'rgb(255, 255, 255, 0.95)', border: '1px solid #1ba7df' }}
                    >
                        Database
                    </Button>
                    <Button
                        href='/visualizations'
                        size="large"
                        icon={<BarChartOutlined />}
                        style={{ backgroundColor: '#46bbc8', color: 'rgb(255, 255, 255, 0.95)', border: '1px solid #46bbc8' }}
                    >
                        Network
</Button>
                    
                    <Button
                        href='/tutorial'
                        size="large"
                        icon={<FileTextOutlined/>}
                        style={{ backgroundColor: '#1ba7df', color: 'rgb(255, 255, 255, 0.95)', border: '1px solid #1ba7df' }}
                    >
                        Tutorial
                    </Button>
                </Stack>
            </Stack>
        </Grid>
        <Grid size={7}>
            <img
                src="/ceRNAxis_framework.svg"
                alt="Framework"
                width='100%'
            />
        </Grid>
    </Grid>
)

export default HomeIntroduction
