import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import TreeGrid, { DEFAULT_CURRENCY } from '@/components/TreeGrid'
import { NodeMap, BudgetType, NodeType, Graph } from '@/components/treegrid/State';
import { useObservable } from '@legendapp/state/react';
import { persistObservable } from '@legendapp/state/persist';
import "@/lib/persistence";
import { Money } from '@/lib/money';
import { AddNewState } from '@/components/treegrid/AddNew';
import Edit, * as EditForm from "@/components/treegrid/Edit";
import { useEffect } from 'react';

function usd(amount: number): Money {
  return { amount, currency: DEFAULT_CURRENCY };
}

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const initialNode = {
    id: "ROOT",
    name: "Project",
    agent: "Unknown",
    depth: 0,
    children: [],
    parent: null,
    budget: usd(0),
    budgetType: "automatic" as BudgetType,
    usedBudget: usd(0),
    type: "intent" as NodeType
  }
  const initialNodes: NodeMap = {};
  initialNodes[initialNode.id] = initialNode;
  
  const state = useObservable({ graph: { nodes: {} /*initialNodes*/, edges: { children: {}, parents: {}}} as Graph, addNew: { open: false } as AddNewState, edit: { open: false } as EditForm.EditState});

  useEffect(() => {
    if (window.localStorage !== undefined) {
      persistObservable(state, {
        local: {
          name: "store",
        },
      });
    }
  });
 


  return (
    <>
      <Head>
        <title>Budget Graph</title>
        <meta name="description" content="Budget graph demo" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <main className="container mx-auto">
        <h1 className="font-semibold text-3xl mb-6">Budget Graph</h1>
        <TreeGrid state={state}></TreeGrid>        
      </main>
    </>
  )
}
