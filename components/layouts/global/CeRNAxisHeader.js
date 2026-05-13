import CustomHeader from "@/components/ui/layout/CustomHeader"
import { Box, Stack } from "@mui/system"
import Image from "next/image"
import { useRouter } from "next/router"
import CustomHeaderMenu from "@/components/ui/menu/CustomHeaderMenu"
import {
    BarChartOutlined,
    FileTextOutlined,
    HomeOutlined,
    MailOutlined
} from "@ant-design/icons"
import DatabaseIcon from "@/components/icons/Database"

const CeRNAxisHeader = () => (
    <CustomHeader>
        <Stack direction='row' justifyContent='space-between'>
            <LogoSection/>
            <HeaderMenu/>
        </Stack>
    </CustomHeader>
)

const LogoSection = () => (
    <Box
        component='a'
        href='/'
        sx={{
            height: '64px',
            lineHeight: '64px',
            display: 'inline-flex',
            columnGap: '8px',
            alignItems: 'center',
            fontSize: '28px',
            overflow: 'hidden',
            color: '#000000',
            marginLeft: '-10px',
        }}
    >
        <Image
            src='/ceRNAxis_logo.svg'
            width={130}
            height={56}
            alt='CeRNAxis Logo'
            priority
        />
        <Image
            src='/ceRNAxis.svg'
            width={120}
            height={40}
            alt='CeRNAxis Text'
            priority
            style={{ marginLeft: '-40px' }}
        />
        
    </Box>
)

const HeaderMenu = () => {
    const router = useRouter()

    const handleClick = ({ item }) => {
        router.push(item.props.link)
    }

    return (
        <CustomHeaderMenu
            mode="horizontal"
            items={menuItems}
            onClick={handleClick}
            selectable={false}
        />
    )
}

const menuItems = [
    {
        key: 'home',
        label: 'Home',
        icon: <HomeOutlined style={{ fontSize: '20px' }}/>,
        link: '/'
    },
    {
        key: 'database',
        label: 'Database',
        icon: <DatabaseIcon style={{ fontSize: '20px' }}/>,
        link: '/database'
    },
    {
        key: 'analysis',
        label: 'Network',
        icon: <BarChartOutlined style={{ fontSize: '20px' }}/>,
        link: '/visualizations'
    },
    
    {
        key: 'tutorial',
        label: 'Tutorial',
        icon: <FileTextOutlined style={{ fontSize: '20px' }}/>,
        link: '/tutorial'
    },
    {
        key: 'contactUs',
        label: 'Contact us',
        icon: <MailOutlined style={{ fontSize: '20px' }}/>,
        link: '/contact'
    }
]

export default CeRNAxisHeader
