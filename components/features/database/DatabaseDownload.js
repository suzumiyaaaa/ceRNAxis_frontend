import { useState } from "react"
import { Box } from "@mui/system"
import { Button, Dropdown, message, Modal, Typography, Space } from "antd"
import { DownloadOutlined, DownOutlined } from "@ant-design/icons"
import Papa from "papaparse"

const { Text } = Typography

const DatabaseDownload = ({ data, selectedRows = [] }) => {
    const [loading, setLoading] = useState(false)
    const [modalVisible, setModalVisible] = useState(false)

    const getSelectedData = () => {
        if (!selectedRows || selectedRows.length === 0 || !data) {
            return []
        }
        // selectedRows contains row keys (ids), need to filter data by id
        return data.filter(item => selectedRows.includes(item.id))
    }

    const handleDownload = (format, downloadAll = false) => {
        setLoading(true)

        try {
            const downloadData = downloadAll ? data : getSelectedData()

            if (!downloadData || downloadData.length === 0) {
                message.warning("No data available for download")
                return
            }

            let content, mimeType, fileName

            switch (format) {
                case 'csv':
                    const csv = Papa.unparse(downloadData)
                    content = csv
                    mimeType = 'text/csv;charset=utf-8;'
                    fileName = `ceRNAxis_database_${new Date().toISOString().split('T')[0]}.csv`
                    break

                case 'json':
                    content = JSON.stringify(downloadData, null, 2)
                    mimeType = 'application/json'
                    fileName = `ceRNAxis_database_${new Date().toISOString().split('T')[0]}.json`
                    break

                case 'tsv':
                    const tsv = Papa.unparse(downloadData, { delimiter: '\t' })
                    content = tsv
                    mimeType = 'text/tab-separated-values'
                    fileName = `ceRNAxis_database_${new Date().toISOString().split('T')[0]}.tsv`
                    break

                default:
                    throw new Error('Unsupported format')
            }

            // 创建下载链接
            const blob = new Blob([content], { type: mimeType })
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)

            message.success(`Downloaded ${downloadData.length} records as ${format.toUpperCase()}`)
        } catch (error) {
            message.error(`Download failed: ${error.message}`)
        } finally {
            setLoading(false)
            setModalVisible(false)
        }
    }

    const items = [
        {
            key: 'csv',
            label: 'CSV Format',
            onClick: () => handleDownload('csv', true)
        },
        {
            key: 'json',
            label: 'JSON Format',
            onClick: () => handleDownload('json', true)
        },
        {
            key: 'tsv',
            label: 'TSV Format',
            onClick: () => handleDownload('tsv', true)
        }
    ]

    const showDownloadModal = () => {
        setModalVisible(true)
    }

    return (
        <Box>
            <Space>
                <Dropdown
                    menu={{ items }}
                    trigger={['click']}
                >
                    <Button type="primary" icon={<DownloadOutlined />} loading={loading}>
                        Download All <DownOutlined />
                    </Button>
                </Dropdown>

                <Button
                    icon={<DownloadOutlined />}
                    onClick={showDownloadModal}
                    disabled={selectedRows.length === 0}
                >
                    Download Selected ({selectedRows.length})
                </Button>
            </Space>

            <Modal
                title="Download Options"
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={null}
                width={400}
            >
                <Box sx={{ py: 2 }}>
                    <Text type="secondary" style={{ marginBottom: 16, display: 'block' }}>
                        Download {selectedRows.length} selected records in:
                    </Text>

                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Button
                            block
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload('csv', false)}
                            loading={loading}
                            size="large"
                        >
                            CSV Format
                        </Button>

                        <Button
                            block
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload('json', false)}
                            loading={loading}
                            size="large"
                        >
                            JSON Format
                        </Button>

                        <Button
                            block
                            icon={<DownloadOutlined />}
                            onClick={() => handleDownload('tsv', false)}
                            loading={loading}
                            size="large"
                        >
                            TSV Format
                        </Button>
                    </Space>
                </Box>
            </Modal>
        </Box>
    )
}

export default DatabaseDownload