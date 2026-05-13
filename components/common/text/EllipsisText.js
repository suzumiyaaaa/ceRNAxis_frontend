import { Tooltip } from "antd"

//将文本显示为单行，且当文本内容过长时，会以省略号（...）的方式显示，同时当鼠标悬停在文本上时，显示完整的文本内容作为工具提示。
const EllipsisText = ({ text, width = 200 }) => (
    <Tooltip title={text}>
        <div
            style={{
                minWidth: '0px',
                maxWidth: width,
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
            }}
        >
            {text || '--'}
        </div>
    </Tooltip>
)

export default EllipsisText
