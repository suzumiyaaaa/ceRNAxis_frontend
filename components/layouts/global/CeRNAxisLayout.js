import { MessageContext } from "@/context/MessageContext"
import { Layout, message } from "antd"
import CeRNAxisContent from "@/components/layouts/global/CeRNAxisContent"
import CeRNAxisHeader from "@/components/layouts/global/CeRNAxisHeader"
import CeRNAxisFooter from "@/components/layouts/global/CeRNAxisFooter"
import BrowserAlert from "@/components/common/alert/BrowserAlert"

const CeRNAxisLayout = ({ children }) => {
    const [messageApi, contextHolder] = message.useMessage()

    return(
        <MessageContext.Provider value={messageApi}>
            <Layout>
                <CeRNAxisHeader />
                    <CeRNAxisContent>
                        {contextHolder}
                        {children}
                    </CeRNAxisContent>
                <CeRNAxisFooter />
                <BrowserAlert/>
            </Layout>
        </MessageContext.Provider>
    
    )
}

export default CeRNAxisLayout
