import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import TreeGrid from '@/components/TreeGrid'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Budget Graph</title>
        <meta name="description" content="Budget graph demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto">
        <h1 className="font-semibold text-3xl mb-6">Budget Graph</h1>
        <TreeGrid></TreeGrid>        
      </main>
    </>
  )
}
