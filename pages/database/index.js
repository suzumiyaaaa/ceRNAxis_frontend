import Head from "next/head"
import DatabaseContent from "@/components/features/database/DatabaseContent"

const Database = () => {
    return (
        <>
            <Head>
                <title>Database | ceRNAxis</title>
                <meta name="description" content="Browse and explore the ceRNAxis database - comprehensive ceRNA interaction data with search, filter, and download capabilities" />
            </Head>
            <DatabaseContent />
        </>
    )
}

export default Database