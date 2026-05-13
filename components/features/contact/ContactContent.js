/**
 * ContactContent组件 - 联系页面内容
 * 显示实验室信息和作者联系方式
 */
import { Box, Grid, Stack } from "@mui/system"
import {
    BankOutlined,
    BookOutlined,
    EnvironmentOutlined,
    ExperimentOutlined,
    MailOutlined,
    UserOutlined
} from "@ant-design/icons"
import { Card } from "antd"

/**
 * 主联系页面组件
 */
const ContactContent = ({}) => {

    return (
        <Stack>
            <ContactHeader/>
            <ContactBody/>
        </Stack>
    )
}

/**
 * 联系页面标题组件
 * 显示"Contact"标题
 */
const ContactHeader = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center', marginTop: '40px'}}>
            <Box component='h6' sx={{ fontSize: '64px' }}>Contact</Box>
        </Stack>
    )
}

/**
 * 联系页面主体布局组件
 * 使用Grid布局展示实验室介绍和作者信息
 */
const ContactBody = () => {
    return (
        <Grid container spacing={2} sx={{marginTop: '64px', marginBottom: '48px'}}>
            <Grid size={5} offset={0.5}>
                <TeamIntroduction/>
            </Grid>
            <Grid size={6} offset={0.5}>
                <Authors/>
            </Grid>
        </Grid>
    )
}

/**
 * 实验室介绍组件
 * 显示两个实验室的详细信息：Feng's Lab 和 Chen's Lab
 */
const TeamIntroduction = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center'}}>
            <Box component='h6' sx={{fontSize: '40px', paddingBottom: '20px'}}>Our Labs</Box>
            <Stack
                sx={{
                    border: '1px solid #0000001F',
                    borderRadius: '10px',
                    padding: '40px 36px'
                }}
                spacing={4}
            >
                <Stack spacing={1} sx={{alignItems: 'center'}}>
                    <Box
                        component='h6'
                        sx={{
                            fontSize: '32px',
                            paddingBottom: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Feng&apos;s Lab Information
                    </Box>
                    <Stack spacing={2} sx={{alignSelf: 'flex-start', fontSize: '24px'}}>
                        <Stack direction="row" spacing={1}>
                            <ExperimentOutlined/>
                            <Box component='span'><b>Lab Name:</b> <a href="https://github.com/BioThinkLab"
                                                      target="_blank">BioThinkLab</a></Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BookOutlined/>
                            <Box component='span'><b>Department:</b> School of Software</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BankOutlined/>
                            <Box component='span'><b>School:</b> Northwestern Polytechnical University</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <MailOutlined/>
                            <Box component='span'><b>Email:</b> fxk@nwpu.edu.cn</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <UserOutlined/>
                            <Box component='span'><b>Profile:</b> <a href="https://fengslab.com/"
                                                                   target="_blank">Xikang Feng</a></Box>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                            <EnvironmentOutlined/>
                            <Box component='span'><b>Address:</b> No. 127 Taicang Avenue, Taicang City, Jiangsu Province</Box>
                        </Stack>
                    </Stack>
                </Stack>
                <Stack spacing={1} sx={{alignItems: 'center'}}>
                    <Box
                        component='h6'
                        sx={{
                            fontSize: '32px',
                            paddingBottom: '16px',
                            fontWeight: '600'
                        }}
                    >
                        Chen&apos;s Lab Information
                    </Box>
                    <Stack spacing={2} sx={{alignSelf: 'flex-start', fontSize: '24px'}}>
                        <Stack direction="row" spacing={1}>
                            <ExperimentOutlined/>
                            <Box component='span'><b>Lab Name:</b> <a href="https://compbioclub.github.io"
                                                                      target="_blank">CompBioClub</a></Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BookOutlined/>
                            <Box component='span'><b>Department:</b> Department of Biomedical Sciences</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <BankOutlined/>
                            <Box component='span'><b>School:</b> City University of Hong Kong</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <MailOutlined/>
                            <Box component='span'><b>Email:</b> lingxi.chen@cityu.edu.hk</Box>
                        </Stack>
                        <Stack direction="row" spacing={1}>
                            <UserOutlined/>
                            <Box component='span'><b>Profile:</b> <a href="https://www.cityu.edu.hk/bms/profile/lingxichen.htm"
                                                                     target="_blank">Lingxi Chen</a></Box>
                        </Stack>
                        <Stack direction="row" spacing={1} sx={{alignItems: 'center'}}>
                            <EnvironmentOutlined/>
                            <Box component='span'><b>Address:</b> 1B-109, 1/F, Block 1, To Yuen Building, Tat Chee Avenue, Kowloon, Hong Kong, China</Box>
                        </Stack>
                    </Stack>
                </Stack>
            </Stack>
        </Stack>
    )
}

/**
 * 作者卡片组件
 * 显示单个作者的信息卡片，包括姓名和邮箱
 * @param {string} name - 作者姓名
 * @param {string} email - 作者邮箱
 * @param {string} char - 头像字符（暂未使用）
 * @param {number} colorIndex - 颜色索引（暂未使用）
 */
const AuthorsCard = ({name, email, char, colorIndex = 0}) => {
    const colors = [
        '#f56a00', '#7265e6', '#ffbf00', '#00a2ae',
        "#FF5733", "#33FF57", "#5733FF", "#FF33A1",
        "#33A1FF", "#F9A825", "#8E24AA", "#00BCD4",
        "#009688", "#3F51B5"
    ]

    return (
        <Card
            style={{
                width: 320,
                border: '1px solid #0000001F',
                fontSize: '18px',
            }}
        >
            {/* 头像部分（当前被注释掉） */}
            {/*<Stack sx={{ alignItems: 'center', paddingBottom: '12px' }}>*/}
            {/*    <Avatar style={{ backgroundColor: colors[colorIndex], verticalAlign: 'middle' }} size={56}>*/}
            {/*        {char}*/}
            {/*    </Avatar>*/}
            {/*</Stack>*/}

            <Stack spacing={1}>
                {/* 姓名 */}
                <Stack direction="row" spacing={1}>
                    <UserOutlined />
                    <Box component='span' sx={{ fontWeight: '600' }}>{name}</Box>
                </Stack>
                {/* 邮箱 */}
                <Stack direction="row" spacing={1}>
                    <MailOutlined/>
                    <Box component='span'>{email}</Box>
                </Stack>
            </Stack>
        </Card>
    )
}

/**
 * 作者列表组件
 * 显示所有项目作者的信息卡片，使用网格布局排列
 */
const Authors = () => {
    return (
        <Stack spacing={1} sx={{alignItems: 'center'}}>
            <Box component='h6' sx={{fontSize: '40px', paddingBottom: '20px'}}>Authors</Box>
            <Stack spacing={4}>
                {/* 第一行：两位主要作者 */}
                <Grid container spacing={3.5} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Xikang Feng" email="fxk@nwpu.edu.cn" char="F" colorIndex={4} />
                    </Grid>
                    <Grid xs={6}>
                        <AuthorsCard name="Lingxi Chen" email="lingxi.chen@cityu.edu.hk" char="C" colorIndex={3} />
                    </Grid>
                </Grid>
                {/* 第二行：两位作者 */}
                <Grid container spacing={3.5} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Qiangguo Jin" email="qgking@nwpu.edu.cn" char="Z" colorIndex={12} />
                    </Grid>
                    <Grid xs={6}>
                        <AuthorsCard name="Jieyi Zheng" email="zhengjieyi@mail.nwpu.edu.cn" char="Z" colorIndex={12} />
                    </Grid>
                </Grid>
                {/* 第三行：两位作者 */}
                <Grid container spacing={3.5} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Sisi Peng" email="sisipeng@mail.nwpu.edu.cn" char="Z" colorIndex={12} />
                    </Grid>
                    <Grid xs={6}>
                        <AuthorsCard name="Anna Jiang" email="anna.jiang@my.cityu.edu.hk" char="Z" colorIndex={12} />
                    </Grid>
                </Grid>
                {/* 第四行：单独作者 */}
                <Grid container spacing={3.5} sx={{ fontSize: '20px' }}>
                    <Grid xs={6}>
                        <AuthorsCard name="Chengshang Lyu" email="cs.lyu@my.cityu.edu.hk" char="Z" colorIndex={12} />
                    </Grid>
                </Grid>
            </Stack>
        </Stack>
    )
}

export default ContactContent
