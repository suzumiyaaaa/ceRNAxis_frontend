# ceRNAxis Frontend

An interactive web platform for visualizing and exploring ceRNA (competitive endogenous RNA) interaction networks. Built with Next.js and ECharts/Cytoscape.js.

## Features

- **Network Topology Graph** — Explore ceRNA networks with lncRNA, circRNA, miRNA, and mRNA nodes
- **Gene Correlation Network** — Visualize co-expression and regulatory relationships between genes
- **Expression Heatmap** — Browse gene expression patterns across tissue types and conditions
- **Path Search** — Find multi-hop regulatory paths between two RNA molecules
- **Node Search & Expansion** — Search nodes by type and species, expand to reveal neighbors
- **Database Browser** — Query, filter, paginate, and export ceRNA interaction records

## Tech Stack

- [Next.js 14](https://nextjs.org/) (Page Router)
- [Apache ECharts](https://echarts.apache.org/) — Chart & heatmap rendering
- [Cytoscape.js](https://js.cytoscape.org/) — Network graph visualization
- [Ant Design](https://ant.design/) — UI component library
- [MUI System](https://mui.com/system/) — Layout & styling utilities

## Getting Started

### Prerequisites

- Node.js >= 18.17.0

### Installation

```bash
npm install
```

### Configuration

```bash
cp .env.example .env.local
```

| Variable | Description | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/cerna` |

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

## Project Structure

```
├── components/     # React components (features, UI, common)
├── context/        # React context providers
├── lib/            # Shared utilities & API client config
├── pages/          # Next.js page routes
│   └── visualizations/  # Individual visualization pages
├── public/         # Static assets & mock data
├── services/       # API service layer
├── stores/         # Zustand state stores
├── styles/         # Global styles
├── theme/          # MUI / Ant Design theme tokens
└── utils/          # Helper functions
```

## Related Repositories

- [ceRNAxis Backend](https://github.com/suzumiyaaaa/ceRNAxis-backend) — Django REST API server

## License

[MIT](LICENSE)
