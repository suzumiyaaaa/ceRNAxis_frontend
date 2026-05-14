import { useState } from "react"
import { Box } from "@mui/system"
import { Menu, Typography, Divider, Tag } from "antd"
import {
  DatabaseOutlined,
  SearchOutlined,
  DownloadOutlined,
  ShareAltOutlined,
  InfoCircleOutlined,
  FilterOutlined,
  TableOutlined,
  NodeIndexOutlined,
} from "@ant-design/icons"

const { Title, Paragraph, Text, Link } = Typography

const menuItems = [
  {
    key: 'overview-group',
    label: 'Overview',
    type: 'group',
    children: [
      {
        key: 'introduction',
        label: 'Introduction',
      },
    ],
  },
  {
    key: 'database-group',
    label: 'Database',
    type: 'group',
    children: [
      {
        key: 'database-introduction',
        label: 'Database introduction',
      },
      {
        key: 'database-exploration',
        label: 'Database exploration',
      },
      {
        key: 'database-download',
        label: 'Database download',
      },
    ],
  },
  {
    key: 'visualization-group',
    label: 'Network',
    type: 'group',
    children: [
      {
        key: 'cerna-interaction-network',
        label: 'ceRNA Interaction Network',
      },
      {
        key: 'multi-hop-path-search',
        label: 'Multi-hop Path Search',
      },
    ],
  },
]

const contentComponents = {
  // ==================== Overview ====================
  'introduction': (
    <div>
      <Title level={2}>
        <InfoCircleOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        Introduction
      </Title>

      <Title level={3}>What is ceRNAxis?</Title>
      <Paragraph>
        <Text strong>ceRNAxis</Text> is an interactive web platform for exploring and visualizing
        <Text strong> competitive endogenous RNA (ceRNA)</Text> interaction networks.
        The ceRNA hypothesis proposes that RNA transcripts (mRNAs, lncRNAs, circRNAs, pseudogenes)
        can competitively bind to shared microRNAs (miRNAs) via miRNA response elements (MREs),
        thereby acting as molecular sponges to cross-regulate each other&rsquo;s expression levels.
      </Paragraph>

      <Title level={3}>Platform Overview</Title>
      <Paragraph>
        ceRNAxis integrates <Text strong>8,008,329</Text> ceRNA interaction records from <Text strong>7</Text> major
        public databases covering <Text strong>Homo sapiens</Text>, providing researchers with a unified interface
        for data retrieval, interactive network visualization, and multi-hop pathway discovery. The platform
        consists of three core modules:
      </Paragraph>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 16 }}>
        {[
          {
            icon: <DatabaseOutlined style={{ fontSize: 28, color: '#1ba7df' }} />,
            title: 'Database',
            desc: 'Browse, search, filter, and download over 8 million ceRNA interaction records across 7 integrated data sources.',
            path: '/database'
          },
          {
            icon: <ShareAltOutlined style={{ fontSize: 28, color: '#46bbc8' }} />,
            title: 'Network',
            desc: 'Interactive stepwise visualization of ceRNA interaction networks and multi-hop pathway search between RNA molecules.',
            path: '/visualizations'
          },
          {
            icon: <DownloadOutlined style={{ fontSize: 28, color: '#f59e0b' }} />,
            title: 'Data Export',
            desc: 'Export interaction data in CSV, JSON, or TSV formats; export network diagrams as PNG or SVG images.',
            path: '/database'
          },
        ].map(item => (
          <div key={item.title} style={{
            flex: '1 1 220px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: '20px 18px',
            textAlign: 'center',
          }}>
            <div style={{ marginBottom: 8 }}>{item.icon}</div>
            <Text strong style={{ fontSize: 14 }}>{item.title}</Text>
            <Paragraph style={{ fontSize: 12, color: '#64748b', marginTop: 6, lineHeight: 1.6 }}>
              {item.desc}
            </Paragraph>
          </div>
        ))}
      </div>

      <Title level={3} style={{ marginTop: 28 }}>Database Sources</Title>
      <Paragraph>
        The ceRNAxis database consolidates interactions from the following 7 public databases:
      </Paragraph>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {[
          { name: 'miRWalk', count: '6,623,724', color: '#3b82f6' },
          { name: 'RNAInter', count: '846,350', color: '#10b981' },
          { name: 'miRDB 6.0', count: '413,615', color: '#f59e0b' },
          { name: 'miRTarBase 9.0', count: '388,188', color: '#ef4444' },
          { name: 'NPInter 4.0', count: '120,479', color: '#8b5cf6' },
          { name: 'TargetSCAN 8.0', count: '109,249', color: '#ec4899' },
          { name: 'ENCORI', count: '63,698', color: '#06b6d4' },
        ].map(db => (
          <Tag key={db.name} color={db.color} style={{ fontSize: 12, padding: '2px 10px' }}>
            {db.name}: {parseInt(db.count.replace(/,/g, '')).toLocaleString()}
          </Tag>
        ))}
      </div>
      <Paragraph>
        These databases cover <Text strong>2</Text> interaction types: miRNA-mRNA (7,831,819 records)
        and miRNA-lncRNA (187,425 records), encompassing diverse RNA types including mRNA, lncRNA,
        circRNA, and pseudogenes.
      </Paragraph>

      <Title level={3} style={{ marginTop: 28 }}>Technology Stack</Title>
      <Paragraph>
        ceRNAxis is built with <Text strong>Next.js 14</Text> (Pages Router) and <Text strong>React 18</Text> for the
        frontend framework, using <Text strong>Ant Design 5</Text> and <Text strong>MUI System</Text> for UI components.
        Network visualization is powered by <Text strong>Cytoscape.js</Text> and <Text strong>ECharts</Text>.
        State management leverages <Text strong>Zustand</Text> stores, with data fetching via <Text strong>SWR</Text> and <Text strong>Axios</Text>.
        The backend connects to a PostgreSQL database storing the complete ceRNA interaction dataset.
      </Paragraph>
    </div>
  ),

  // ==================== Database Introduction ====================
  'database-introduction': (
    <div>
      <Title level={2}>
        <DatabaseOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        Database Introduction
      </Title>

      <Title level={3}>Data Overview</Title>
      <Paragraph>
        The ceRNAxis database provides a comprehensive, curated collection of ceRNA interactions.
        It contains <Text strong>8,008,329</Text> records in total, all from <Text strong>Homo sapiens</Text>,
        integrated and harmonized from 7 major public databases. The database is designed to facilitate
        research on ceRNA regulatory mechanisms by offering a searchable, filterable, and downloadable
        interface.
      </Paragraph>

      <Title level={3}>Interaction Types</Title>
      <Paragraph>
        The database covers <Text strong>2</Text> types of interactions:
      </Paragraph>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: '#f0f7ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ color: '#3b82f6', fontSize: 15 }}>miRNA &rarr; mRNA</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            MicroRNA targeting messenger RNA. This is the canonical regulatory interaction where miRNAs
            bind to the 3&prime;UTR of mRNAs to suppress translation or promote degradation.
            <Text strong> 7,831,819 records</Text>.
          </Paragraph>
        </div>
        <div style={{
          flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ color: '#ef4444', fontSize: 15 }}>miRNA &rarr; lncRNA</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            MicroRNA targeting long non-coding RNA. lncRNAs can act as ceRNA sponges by competitively
            binding miRNAs, thereby sequestering them from their mRNA targets.
            <Text strong> 187,425 records</Text>.
          </Paragraph>
        </div>
      </div>

      <Title level={3}>Data Model</Title>
      <Paragraph>
        Each record in the database contains the following key attributes:
      </Paragraph>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Field</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Description</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Example</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>miRNA</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>The microRNA involved in the interaction</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Tag color="blue">hsa-miR-21-5p</Tag></td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>ceRNA</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>The competing endogenous RNA (mRNA, lncRNA, circRNA, or pseudogene)</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Tag color="purple">TP53</Tag></td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Species</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>The organism species (currently Homo sapiens)</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Homo sapiens</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Database</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>The source database of the interaction record</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>miRWalk, miRTarBase, etc.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>ceRNA Type</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>The molecular type of the ceRNA</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
              <Tag color="green">mRNA</Tag> <Tag color="red">lncRNA</Tag> <Tag color="purple">circRNA</Tag>
            </td>
          </tr>
        </tbody>
      </table>

      <Title level={3}>Accessing the Database</Title>
      <Paragraph>
        You can access the database through the <Link href="/database" target="_blank"><Text strong>Database page</Text></Link> of the
        ceRNAxis platform. The page provides a complete set of tools for searching, filtering, browsing, and downloading
        interaction data. The database is also accessible programmatically via the REST API endpoints served by the
        ceRNAxis backend.
      </Paragraph>
    </div>
  ),

  // ==================== Database Exploration ====================
  'database-exploration': (
    <div>
      <Title level={2}>
        <SearchOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        Database Exploration
      </Title>

      <Title level={3}>Navigating to the Database</Title>
      <Paragraph>
        The <Link href="/database" target="_blank"><Text strong>Database page</Text></Link> is accessible from the top navigation
        bar or the home page. It presents a unified interface with three main sections:
        <Text strong> Search &amp; Filter</Text>, <Text strong>Database Records</Text> (table with download), and
        <Text strong> Database Statistics</Text>.
      </Paragraph>

      <Divider />

      <Title level={3}>
        <SearchOutlined style={{ marginRight: 6 }} />
        Step 1: Searching the Database
      </Title>
      <Paragraph>
        Use the <Text strong>search box</Text> at the top of the Search &amp; Filter card to enter keywords.
        You can search by:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>miRNA name or ID</Text> &mdash; e.g., <Text code>hsa-miR-21-5p</Text>, <Text code>miR-155</Text></li>
        <li><Text strong>ceRNA gene name</Text> &mdash; e.g., <Text code>TP53</Text>, <Text code>MALAT1</Text>, <Text code>PTEN</Text></li>
        <li><Text strong>Partial keywords</Text> &mdash; e.g., <Text code>miR-21</Text> will match all miR-21 family members</li>
      </ul>
      <Paragraph>
        The search triggers a query to the backend API and returns matching records in the table below.
        Results are automatically paginated for performance.
      </Paragraph>

      <Divider />

      <Title level={3}>
        <FilterOutlined style={{ marginRight: 6 }} />
        Step 2: Filtering Results
      </Title>
      <Paragraph>
        The filter panel provides <Text strong>5</Text> filter dimensions to narrow down your search results.
        Filters are applied automatically with a 500ms debounce after you make a change.
      </Paragraph>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Filter</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>miRNA Name</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Text input</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Enter a specific miRNA identifier, e.g., <Text code>hsa-miR-21-5p</Text>. Supports partial matching and clearable input.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>ceRNA Name</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Text input</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Enter a ceRNA gene symbol, e.g., <Text code>TP53</Text>, <Text code>MALAT1</Text>. Supports partial matching and clearable input.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Species</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Dropdown select</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Select a species (currently Homo sapiens). Options are dynamically loaded from the backend.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Database</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Multi-select dropdown</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Filter by one or more source databases (miRWalk, RNAInter, miRDB, miRTarBase, NPInter, TargetSCAN, ENCORI). Supports multiple selections.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>ceRNA Type</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Multi-select dropdown</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Filter by RNA type (mRNA, lncRNA, circRNA, pseudogene, etc.). Supports multiple selections.</td>
          </tr>
        </tbody>
      </table>
      <Paragraph>
        Use the <Text strong>Apply Filters</Text> button to manually trigger filtering, or
        <Text strong> Reset All</Text> to clear all filters and return to the full dataset. The current
        filter state is reflected in the table results immediately.
      </Paragraph>

      <Divider />

      <Title level={3}>
        <TableOutlined style={{ marginRight: 6 }} />
        Step 3: Browsing the Data Table
      </Title>
      <Paragraph>
        The <Text strong>Database Records</Text> table displays the query results with the following columns:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong style={{ color: '#3b82f6' }}>miRNA</Text> &mdash; The microRNA name (displayed in blue text)</li>
        <li><Text strong style={{ color: '#7c3aed' }}>ceRNA</Text> &mdash; The competing endogenous RNA name (displayed in purple text)</li>
        <li><Text strong>Species</Text> &mdash; The organism species (displayed as a Tag)</li>
        <li><Text strong>Database</Text> &mdash; The source database(s) (displayed as colored Tags)</li>
        <li><Text strong>ceRNA Type</Text> &mdash; The RNA molecule type (color-coded Tags)</li>
      </ul>
      <Paragraph>
        <Text strong>Key table features:</Text>
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Column sorting</Text> &mdash; Click any column header to sort ascending/descending</li>
        <li><Text strong>Pagination</Text> &mdash; Choose page size from 10, 20, 50, 100, 200, 500, or 1000 records per page</li>
        <li><Text strong>Quick-jump</Text> &mdash; Enter a specific page number to jump directly</li>
        <li><Text strong>Row selection</Text> &mdash; Check individual rows or use the header checkbox to select all rows on the current page. Selected rows can be downloaded separately</li>
        <li><Text strong>Virtual scrolling</Text> &mdash; Efficient rendering for large result sets with smooth scrolling performance</li>
      </ul>

      <Divider />

      <Title level={3}>Step 4: Viewing Statistics</Title>
      <Paragraph>
        The <Text strong>Database Statistics</Text> card at the bottom of the page displays:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Total Records</Text> &mdash; The total number of records matching your current search and filter criteria</li>
        <li><Text strong>Last Updated</Text> &mdash; The timestamp of the most recent database update</li>
      </ul>
    </div>
  ),

  // ==================== Database Download ====================
  'database-download': (
    <div>
      <Title level={2}>
        <DownloadOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        Database Download
      </Title>

      <Title level={3}>Download Options</Title>
      <Paragraph>
        The Database page provides two flexible download modes through the <Text strong>DatabaseDownload</Text> component.
        All downloads are processed client-side using <Text strong>PapaParse</Text> for robust CSV/TSV serialization,
        ensuring data integrity regardless of special characters in the data.
      </Paragraph>

      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 8, padding: '16px 18px'
        }}>
          <Text strong style={{ fontSize: 15, color: '#0ea5e9' }}>Download All</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 6, marginBottom: 0, color: '#475569' }}>
            The primary <Text strong>Download All</Text> button is a dropdown menu that lets you export the
            entire current result set (after applying search/filter criteria) in one of three formats.
            Click the button and select your desired format from the dropdown.
          </Paragraph>
        </div>
        <div style={{
          flex: 1, background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8, padding: '16px 18px'
        }}>
          <Text strong style={{ fontSize: 15, color: '#ca8a04' }}>Download Selected</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 6, marginBottom: 0, color: '#475569' }}>
            Select specific rows using the checkboxes in the data table, then click
            <Text strong> Download Selected (N)</Text>. A modal dialog will appear where you can
            choose the export format for your selected records only.
          </Paragraph>
        </div>
      </div>

      <Title level={3}>Supported Formats</Title>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Format</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>MIME Type</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Use Case</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
              <Tag color="green">CSV</Tag>
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>text/csv</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Best for spreadsheet applications (Excel, Google Sheets) and general data analysis. Comma-separated values with header row.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
              <Tag color="blue">JSON</Tag>
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>application/json</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Ideal for programmatic processing, API integration, and data pipelines. Pretty-printed with 2-space indentation.</td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>
              <Tag color="orange">TSV</Tag>
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>text/tab-separated-values</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>Useful when data values contain commas. Tab-separated format, compatible with most bioinformatics tools and spreadsheet software.</td>
          </tr>
        </tbody>
      </table>

      <Title level={3}>File Naming</Title>
      <Paragraph>
        Downloaded files follow the naming pattern:
        <Text code> ceRNAxis_database_YYYY-MM-DD.{'{csv,json,tsv}'} </Text>
      </Paragraph>
      <Paragraph>
        The date in the filename corresponds to the download date, helping you track data versions
        across research workflows.
      </Paragraph>

      <Title level={3}>Usage Notes</Title>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li>Downloads reflect the current search and filter state &mdash; apply filters first to narrow your dataset before downloading</li>
        <li><Text strong>Download All</Text> exports the entire filtered result set, not just the current page</li>
        <li><Text strong>Download Selected</Text> only works when at least one row is checked in the table</li>
        <li>A success notification will display the number of records downloaded and the format</li>
        <li>For large datasets (&gt;10,000 records), the download may take a moment to prepare &mdash; the button shows a loading state during processing</li>
        <li>All data is available for non-commercial research use &mdash; please cite ceRNAxis when using downloaded data in publications</li>
      </ul>
    </div>
  ),

  // ==================== ceRNA Interaction Network ====================
  'cerna-interaction-network': (
    <div>
      <Title level={2}>
        <ShareAltOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        ceRNA Interaction Network
      </Title>

      <Title level={3}>Overview</Title>
      <Paragraph>
        The <Text strong>ceRNA Interaction Network</Text> is an interactive stepwise visualization tool that allows
        researchers to explore over 8 million ceRNA interactions from a PostgreSQL database. Built with
        <Text strong> Cytoscape.js</Text>, it renders molecular interaction networks where nodes represent RNA molecules
        and edges represent regulatory relationships.
      </Paragraph>
      <Paragraph>
        The visualization connects to the <Text strong>ceRNAxis backend API</Text> in real-time &mdash;
        no pre-loaded data. You start by searching for a specific RNA molecule, then incrementally expand
        the network by loading first-degree neighbors and further expanding nodes of interest. This approach
        avoids overwhelming the user with all 8 million records at once.
      </Paragraph>

      <Divider />

      <Title level={3}>Node Types and Color Scheme</Title>
      <Paragraph>
        Each node in the network is color-coded by its RNA type for immediate visual identification:
      </Paragraph>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        <Tag color="#3b82f6" style={{ fontSize: 13, padding: '3px 12px' }}>miRNA (blue)</Tag>
        <Tag color="#10b981" style={{ fontSize: 13, padding: '3px 12px' }}>mRNA (green)</Tag>
        <Tag color="#ef4444" style={{ fontSize: 13, padding: '3px 12px' }}>lncRNA (red)</Tag>
        <Tag color="#8b5cf6" style={{ fontSize: 13, padding: '3px 12px' }}>circRNA (purple)</Tag>
        <Tag color="#f59e0b" style={{ fontSize: 13, padding: '3px 12px' }}>Pseudogene (amber)</Tag>
        <Tag color="#f97316" style={{ fontSize: 13, padding: '3px 12px' }}>ceRNA (orange)</Tag>
        <Tag color="#6b7280" style={{ fontSize: 13, padding: '3px 12px' }}>Other (gray)</Tag>
      </div>
      <Paragraph>
        <Text strong>Edges</Text> (connections between nodes) have variable thickness and color based on the
        binding score of the interaction. Hover over any edge to view detailed tooltip information about
        the interaction.
      </Paragraph>

      <Divider />

      <Title level={3}>Step-by-Step Usage Guide</Title>

      <Title level={4}>Step 1: Search for a Node</Title>
      <Paragraph>
        Start by typing a node identifier in the <Text strong>search box</Text> in the left sidebar.
        The search supports miRNA, mRNA, lncRNA, and circRNA IDs or names. Examples:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text code>hsa-miR-21-5p</Text> &mdash; a specific miRNA</li>
        <li><Text code>PVT1</Text> &mdash; an lncRNA gene</li>
        <li><Text code>TP53</Text> &mdash; an mRNA gene</li>
        <li><Text code>MALAT1</Text> &mdash; a well-studied lncRNA</li>
      </ul>
      <Paragraph>
        Search results appear in a dropdown list below the search box. Click on a result to load it as
        the first node in the network.
      </Paragraph>

      <Title level={4}>Step 2: Load First-Degree Neighbors</Title>
      <Paragraph>
        Once a node is on the canvas, click <Text strong>Load Neighbors</Text> to fetch and display all
        directly connected nodes (first-degree neighbors). Before loading, you can apply optional filters:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Species</Text> &mdash; filter neighbors by species</li>
        <li><Text strong>Database</Text> &mdash; restrict to specific source databases</li>
        <li><Text strong>ceRNA Type</Text> &mdash; show only certain RNA types (mRNA, lncRNA, etc.)</li>
      </ul>
      <Paragraph>
        The new nodes and edges will be rendered on the canvas. The layout is automatically chosen based on
        node count:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Circle layout</Text> &mdash; for &le; 10 nodes</li>
        <li><Text strong>Concentric layout</Text> &mdash; for &le; 30 nodes</li>
        <li><Text strong>Grid layout</Text> &mdash; for &gt; 30 nodes</li>
      </ul>

      <Title level={4}>Step 3: Expand Individual Nodes</Title>
      <Paragraph>
        Click any node to <Text strong>select</Text> it, then click <Text strong>Expand Node</Text> to reveal
        additional neighbors of that specific node that are not yet rendered on the canvas. This enables
        progressive exploration of the network &mdash; you control how far out the network grows from your initial
        query. The layout engine avoids re-running during expand operations to prevent disrupting the current view.
      </Paragraph>

      <Title level={4}>Step 4: Interact with the Network</Title>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Click a node</Text> &mdash; select it and view its details in the sidebar</li>
        <li><Text strong>Hover over an edge</Text> &mdash; see interaction details (correlation values, binding scores, tissue information)</li>
        <li><Text strong>Drag nodes</Text> &mdash; manually reposition nodes to better visualize the network topology</li>
        <li><Text strong>Scroll wheel</Text> &mdash; zoom in/out on the canvas</li>
        <li><Text strong>Delete a node</Text> &mdash; click to select a node, then use the delete option to remove it</li>
        <li><Text strong>Reset</Text> &mdash; clear the entire canvas and start fresh</li>
      </ul>

      <Divider />

      <Title level={3}>Export</Title>
      <Paragraph>
        You can export the current network visualization as a high-quality image:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Tag color="blue">PNG</Tag> &mdash; raster image suitable for presentations and publications</li>
        <li><Tag color="green">SVG</Tag> &mdash; vector format ideal for further editing in illustration software</li>
      </ul>

      <Divider />

      <Title level={3}>Performance Notes</Title>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>Rendering limit:</Text> Maximum 500 nodes on the canvas to maintain smooth interaction</li>
        <li><Text strong>Query response:</Text> Single query response time under 2 seconds</li>
        <li><Text strong>Incremental loading:</Text> Data is fetched on-demand via API calls &mdash; never loads the full 8M dataset into the browser</li>
        <li><Text strong>Layout optimization:</Text> Multi-retry layout application with overlap detection to ensure readable network diagrams</li>
      </ul>

      <Divider />

      <Title level={3}>Quick Reference</Title>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Action</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>How To</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Search node</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Type in the search box, click a result</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Load neighbors</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Click Load Neighbors after selecting/enabling filters</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Expand node</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Select a node, click Expand Node</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>View details</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Hover over edges, or select a node to see sidebar info</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Delete node</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Select node, use delete control</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Export</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Click PNG or SVG export button in toolbar</td></tr>
          <tr><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Clear canvas</td><td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}>Click Reset button</td></tr>
        </tbody>
      </table>
    </div>
  ),

  // ==================== Multi-hop Path Search ====================
  'multi-hop-path-search': (
    <div>
      <Title level={2}>
        <NodeIndexOutlined style={{ marginRight: 8, color: '#3b82f6' }} />
        Multi-hop Path Search
      </Title>

      <Title level={3}>Overview</Title>
      <Paragraph>
        The <Text strong>Multi-hop Path Search</Text> tool discovers regulatory pathways between two RNA molecules
        in the ceRNA network. Given a source RNA and a target RNA, it searches for all paths up to a specified
        number of hops (1&ndash;5), revealing the intermediate miRNAs and ceRNAs that form the regulatory chains.
        This is essential for understanding ceRNA-mediated cross-regulation, where lncRNAs and mRNAs compete
        for shared miRNAs.
      </Paragraph>

      <Divider />

      <Title level={3}>Core Concepts</Title>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ fontSize: 15, color: '#16a34a' }}>Hops</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            A hop represents one regulatory step from one RNA molecule to another. For example,
            lncRNA &rarr; miRNA &rarr; mRNA is a 2-hop path: the lncRNA binds the miRNA (hop 1), and the miRNA
            targets the mRNA (hop 2).
          </Paragraph>
        </div>
        <div style={{
          flex: 1, background: '#fdf4ff', border: '1px solid #f0abfc', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ fontSize: 15, color: '#a21caf' }}>Pathways</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            Each pathway is an ordered sequence of nodes and edges connecting the source to the target.
            Multiple distinct pathways may exist between the same two endpoints &mdash; each is displayed
            in a separate color in both the pathway list panel and on the graph.
          </Paragraph>
        </div>
      </div>

      <Divider />

      <Title level={3}>Step-by-Step Usage Guide</Title>

      <Title level={4}>Step 1: Enter Source and Target</Title>
      <Paragraph>
        In the search panel, enter the <Text strong>Source RNA</Text> and <Text strong>Target RNA</Text>.
        Both fields provide <Text strong>auto-suggestions</Text> as you type (300ms debounce), querying the backend
        for matching RNA identifiers. This ensures you enter valid identifiers that exist in the database.
      </Paragraph>
      <Paragraph>
        Use the <Text strong>swap button</Text> (&harr;) between the two inputs to quickly exchange the source
        and target &mdash; useful for exploring reverse regulatory paths.
      </Paragraph>

      <Title level={4}>Step 2: Set Maximum Hops</Title>
      <Paragraph>
        Select the maximum search depth from 1 to 5 hops:
      </Paragraph>
      <ul style={{ fontSize: 13, lineHeight: 2.2, paddingLeft: 20 }}>
        <li><Text strong>1 hop</Text> &mdash; direct interactions (e.g., miRNA &rarr; mRNA). Fastest, simplest results</li>
        <li><Text strong>2&ndash;3 hops</Text> &mdash; typical ceRNA regulatory paths (e.g., lncRNA &rarr; miRNA &rarr; mRNA). Good balance of coverage and clarity</li>
        <li><Text strong>4&ndash;5 hops</Text> &mdash; extended networks. Covers more complex regulation but may produce many pathways and take longer to compute</li>
      </ul>
      <Paragraph>
        Higher hop counts cover more of the regulatory landscape but also increase the number of returned pathways
        and computation time. Start with fewer hops and increase gradually.
      </Paragraph>

      <Title level={4}>Step 3: Run the Search</Title>
      <Paragraph>
        Click the search/execute button to send a POST request to the <Text code>/path-search/</Text> API endpoint.
        The backend computes all valid paths between the source and target nodes within the specified hop limit
        and returns the results.
      </Paragraph>

      <Title level={4}>Step 4: Explore the Results</Title>
      <Paragraph>
        Results are displayed in two coordinated views:
      </Paragraph>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <div style={{
          flex: 1, background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ fontSize: 14, color: '#ea580c' }}>Network Graph (left/center)</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            All nodes and edges from the discovered pathways are rendered on an interactive Cytoscape.js canvas.
            The source node is highlighted with a <Text strong>gold border</Text> and the target node with a
            <Text strong> purple border</Text>. Each pathway is assigned a unique color from a 10-color palette.
          </Paragraph>
        </div>
        <div style={{
          flex: 1, background: '#f5f3ff', border: '1px solid #ddd6fe', borderRadius: 8, padding: '14px 18px'
        }}>
          <Text strong style={{ fontSize: 14, color: '#7c3aed' }}>Pathway List (right panel)</Text>
          <Paragraph style={{ fontSize: 12, marginTop: 4, marginBottom: 0, color: '#475569' }}>
            Lists all discovered pathways with their hop count and node sequence.
            <Text strong> Click on any pathway</Text> in the list to highlight it on the graph &mdash;
            the selected pathway is emphasized while other pathways are dimmed.
          </Paragraph>
        </div>
      </div>

      <Divider />

      <Title level={3}>Visualization Controls</Title>
      <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse', marginBottom: 16 }}>
        <thead>
          <tr style={{ background: '#f1f5f9' }}>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Control</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Options</th>
            <th style={{ padding: '8px 12px', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Layout</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Breadthfirst, Concentric, Force-directed (cose), Circle, Grid
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Switch between 5 layout algorithms. <Text strong>Breadthfirst</Text> is the default and
              best suited for pathway visualization. <Text strong>Force-directed</Text> provides a
              physics-based organic layout. <Text strong>Circle</Text> and <Text strong>Grid</Text> are
              alternatives for dense or compact views.
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Type Filter</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              All, miRNA, mRNA, lncRNA
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Show or hide nodes by RNA type. Useful for decluttering complex networks &mdash; e.g.,
              showing only miRNAs to focus on shared regulators.
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Labels</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Show / Hide
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Toggle node label visibility. Labels show the RNA identifier. Hide labels when
              the network is dense to reduce visual clutter.
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Delete Node</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>&mdash;</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Select a node and delete it (along with all its incident edges) to simplify the view.
            </td>
          </tr>
          <tr>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0' }}><Text strong>Export</Text></td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              PNG, SVG
            </td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid #e2e8f0', color: '#475569' }}>
              Export the current pathway graph as a high-quality PNG or vector SVG image for
              publications and presentations.
            </td>
          </tr>
        </tbody>
      </table>

      <Divider />

      <Title level={3}>Typical Use Cases</Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        {[
          {
            title: 'miRNA → mRNA',
            hops: '1 hop',
            color: 'blue',
            desc: 'Direct miRNA-target regulatory pathway search. Find all mRNAs targeted by a given miRNA, or identify which miRNAs regulate a specific mRNA.'
          },
          {
            title: 'lncRNA → mRNA',
            hops: '2–3 hops',
            color: 'orange',
            desc: 'Discover how a lncRNA indirectly regulates an mRNA through competing miRNA binding. The classic ceRNA mechanism: lncRNA → miRNA → mRNA.'
          },
          {
            title: 'lncRNA → lncRNA',
            hops: '2–4 hops',
            color: 'red',
            desc: 'Find ceRNA pairs — two lncRNAs sharing common miRNAs. Useful for identifying lncRNA cross-talk within the ceRNA regulatory network.'
          },
          {
            title: 'mRNA → mRNA',
            hops: '2 hops',
            color: 'green',
            desc: 'Discover pairs of mRNAs that compete for the same miRNA(s), forming a ceRNA interaction pair. Reveals indirect co-regulation patterns.'
          },
        ].map(item => (
          <div key={item.title} style={{
            flex: '1 1 240px',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            padding: '14px 16px',
          }}>
            <Text strong style={{ fontSize: 13 }}>{item.title}</Text>
            <Tag color={item.color} style={{ marginLeft: 8, fontSize: 11 }}>{item.hops}</Tag>
            <Paragraph style={{ fontSize: 12, color: '#64748b', marginTop: 6, marginBottom: 0, lineHeight: 1.6 }}>
              {item.desc}
            </Paragraph>
          </div>
        ))}
      </div>

      <Divider />

      <Title level={3}>Node Visual Reference</Title>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="#3b82f6" style={{ width: 70, textAlign: 'center' }}>miRNA</Tag>
          <Text style={{ fontSize: 12, color: '#64748b' }}>microRNA &mdash; small non-coding RNA regulating gene expression</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="#10b981" style={{ width: 70, textAlign: 'center' }}>mRNA</Tag>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Messenger RNA &mdash; transcription product of protein-coding genes</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Tag color="#ef4444" style={{ width: 70, textAlign: 'center' }}>lncRNA</Tag>
          <Text style={{ fontSize: 12, color: '#64748b' }}>Long non-coding RNA &mdash; acts as ceRNA to competitively bind miRNA</Text>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #f59e0b' }} />
          <Text style={{ fontSize: 12 }}>Source node (gold border)</Text>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 14, height: 14, borderRadius: '50%', border: '3px solid #8b5cf6' }} />
          <Text style={{ fontSize: 12 }}>Target node (purple border)</Text>
        </div>
      </div>
    </div>
  ),
}

const Tutorial = () => {
  const [selectedKey, setSelectedKey] = useState('introduction')

  const handleMenuClick = (e) => {
    setSelectedKey(e.key)
  }

  const menuItemsFormatted = menuItems.map(group => ({
    key: group.key,
    label: (
      <span style={{ color: '#000', fontWeight: 'bold', fontSize: '14px' }}>
        {group.label}
      </span>
    ),
    type: group.type,
    children: group.children.map(item => ({
      key: item.key,
      label: item.label,
    })),
  }))

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 128px)' }}>
      <Box sx={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <Box
          sx={{
            width: 260,
            flexShrink: 0,
            backgroundColor: '#fff',
            borderRight: '1px solid #e8e8e8',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            borderRadius: '8px 0 0 8px',
            overflowY: 'auto',
            position: 'sticky',
            top: 64,
            alignSelf: 'flex-start',
            maxHeight: 'calc(100vh - 128px)',
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            onClick={handleMenuClick}
            style={{
              borderRight: 0,
              padding: '12px 8px'
            }}
            items={menuItemsFormatted}
          />
        </Box>
        <Box sx={{ flex: 1, overflowY: 'auto', padding: '16px 16px 0' }}>
          <Box sx={{
            padding: '28px',
            background: '#fff',
            borderRadius: '12px',
            boxShadow: '0 3px 10px rgba(0,0,0,0.06)',
            minHeight: 'calc(100vh - 240px)'
          }}>
            {contentComponents[selectedKey] || (
              <Box sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '300px'
              }}>
                <Typography.Text type="secondary">
                  Select a tutorial topic from the left menu to get started.
                </Typography.Text>
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Tutorial
