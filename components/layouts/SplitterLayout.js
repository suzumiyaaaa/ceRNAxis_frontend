import { Splitter } from "antd"

/**
 * SplitterLayout - 可调整大小的分割布局组件
 * 基于 Ant Design 的 Splitter 组件，提供左右面板分割布局
 * 左侧面板可以显示/隐藏，右侧面板始终显示
 *
 * @param {Object} props - 组件属性
 * @param {boolean} props.isShowLeft - 是否显示左侧面板
 * @param {React.ReactNode} props.leftPanel - 左侧面板内容
 * @param {React.ReactNode} props.rightPanel - 右侧面板内容
 * @param {number} [props.leftPanelWidth=280] - 左侧面板宽度（像素），默认为280
 * @returns {JSX.Element} 分割布局组件
 */
const SplitterLayout = ({isShowLeft, leftPanel, rightPanel, leftPanelWidth=280}) => {
    /**
     * 处理分割器调整大小事件
     * @param {number} size - 调整后的面板尺寸
     */
    const handleResize = (size) => {}

    return (
        // 主分割器容器
        <Splitter onResize={handleResize}>
            {/* 左侧面板：根据 isShowLeft 条件显示/隐藏 */}
            <Splitter.Panel
                style={{
                    paddingRight: isShowLeft ? '12px' : 0, // 显示时添加右侧内边距
                }}
                size={isShowLeft ? leftPanelWidth : 0} // 显示时使用指定宽度，隐藏时宽度为0
            >
                {isShowLeft ? leftPanel : null} {/* 条件渲染左侧面板内容 */}
            </Splitter.Panel>

            {/* 右侧面板：始终显示 */}
            <Splitter.Panel
                style={{ paddingLeft: '12px' }} // 添加左侧内边距
                resizable={false} // 禁止调整右侧面板大小
            >
                {rightPanel} {/* 渲染右侧面板内容 */}
            </Splitter.Panel>
        </Splitter>
    )
}

export default SplitterLayout
