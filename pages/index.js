/* import { Box, Stack } from "@mui/system"
import { Button, Descriptions } from "antd"

const BASE_VISUALIZATION_URL = '/visualizations/'

const LinkButton = ({ vizName, text='View Visualization' }) => {
    const url = BASE_VISUALIZATION_URL + vizName

    return (
        <Button type='primary' href={url}>{text}</Button>
    )
}

const visualizationsUrlMapItems = [
    {
        key: '1',
        label: 'Simple Bar Chart Demo',
        children: <LinkButton vizName='SimpleBarChart'/>
    }
]

export default function Home() {
    return (
        <Stack spacing={4} sx={{ marginTop: 4 }}>
            <Stack
                direction='row'
                spacing={6}
                alignItems="center"
                sx={{
                    borderBottom: '2px solid #e0e0e0',
                    paddingBottom: '12px',
                }}
            >
                <Box component='h6' sx={{ fontSize: '42px' }}>
                    Visualizations URL Map
                </Box>
            </Stack>
            <Descriptions
                bordered
                items={visualizationsUrlMapItems}
                column={2}
                labelStyle={{ fontWeight: 'bold' }}
            />
        </Stack>
    )
} */

import { Box, Grid, Stack } from "@mui/system"
import HomeIntroduction from "@/components/features/home/HomeIntroductionV2"
import DividerLine from "@/components/ui/DividerLine"
import HomeFocus from "@/components/features/home/HomeFocusV2"
import KeywordCloud from "@/components/features/home/KeyWordCloud"
import News from "@/components/features/home/News"
import PublicationAlert from "@/components/features/home/PublicationAlert"

export default function Home() {
    return (
        <Stack>
            <HomeIntroduction/>
            <DividerLine/>
            
            <Grid container sx={{ marginTop: '24px' }}>
                <Grid size={6}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                    >
                        <News/>
                    </Box>
                </Grid>
                <Grid size={6}>
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        height="100%"
                    >

                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ marginTop: '24px', mx: '48px' }}>
                <PublicationAlert/>
            </Box>
        </Stack>
    )
}

