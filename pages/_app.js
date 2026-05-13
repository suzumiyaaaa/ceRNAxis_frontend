import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import "@/styles/globals.css";
import { useState } from "react";
import { StyleProvider } from "@ant-design/cssinjs"
import { ConfigProvider } from "antd"
import theme from '/theme/theme'
import Head from "next/head"
import CeRNAxisLayout from "@/components/layouts/global/CeRNAxisLayout"
//import layout from "@/components/layouts";



export default function App({ Component, pageProps }) {

    // 保留通用全局逻辑（如加载状态、消息提示），后续加业务逻辑
    const [loading, setLoading] = useState(false);
    return (
        <StyleProvider layer>
            <ConfigProvider theme={theme}>
                <Head>
                    <title>ceRNAxis</title>
                    <meta name="description" content="ceRNAxis"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1"/>
                    <link rel="icon" href="/favicon.ico"/>
                </Head>
                <CeRNAxisLayout loading={loading}>
                    <Component {...pageProps} />
                </CeRNAxisLayout>
            </ConfigProvider>
        </StyleProvider>
    )
}
