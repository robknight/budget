import { createContext } from "react";
import { Money } from "ts-money";
import { AddNewState } from "./AddNew";
import { EditState } from "./Edit";
import { ObservableObject } from "@legendapp/state";

export type NodeMap = {
  [id: string]: UINode;
}

export interface Graph {
  nodes: NodeMap;
  edges: {
    children: ChildMap,
    parents: ParentMap,
  };
}

export interface Agent {
  id: string;
  name: string;
}

type AgentMap = {
  [id: string]: Agent;
}

export interface State {
  addNew: AddNewState;
  edit: EditState;
  graph: Graph;
//  agents: AgentMap;
}

export type BudgetType = "automatic" | "fixed" | "residual";
export type NodeType = "pseudo" | "intent";

export interface NodeData {
  name: string;
  children: string[];
  parent: string | null;
  budget: Money;
  agent: string;
  usedBudget: Money;
  type: NodeType;
  budgetType: BudgetType;
}

export type ChildMap = { [id: string]: string[] };
export type ParentMap = { [id: string]: string };

export interface Node extends NodeData {
  id: string;
}

export interface UINode extends Node {
  depth: number;
  budget: Money;
}

export interface TreeGridContextType {
  addNew: (parentId: string) => void;
  deleteHandler: (id: string, parentId: string) => void;
  openEdit: (item: ObservableObject<UINode>) => void;
  graph: ObservableObject<Graph>;
}

export const TreeGridContext = createContext({});