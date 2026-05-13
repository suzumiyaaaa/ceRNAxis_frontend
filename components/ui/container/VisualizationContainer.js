import ResponsiveVisualizationContainer from "@/components/common/container/ResponsiveVisualizationContainer"

const VisualizationContainer = ({ children }) => (
    <ResponsiveVisualizationContainer
        containerSx={{
            mt: 4,
            height: '640px',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
            overflowX: 'auto',
            scrollbarColor: '#eaeaea transparent',
            '&::-webkit-scrollbar': {
                height: '6px',
            },
            '&::-webkit-scrollbar-thumb': {
                backgroundColor: '#eaeaea',
                borderRadius: '4px',
            },
            '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
            },
        }}
    >
        {children}
    </ResponsiveVisualizationContainer>
)

export default VisualizationContainer
