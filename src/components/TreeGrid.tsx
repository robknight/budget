import { ObservableObject, batch, ObservableArray } from "@legendapp/state";
import { enableLegendStateReact, useObservable, For, observer, useComputed } from "@legendapp/state/react";
import AddNewDialog, { open, close, AddNewState } from "./treegrid/AddNew";
import { State, TreeGridContext, Node, UINode, BudgetType, NodeType, Graph, NodeMap  } from "./treegrid/State";
import Row from "./treegrid/Row";
import { v4 as uuidv4 } from 'uuid';
import Edit, * as EditForm from "./treegrid/Edit";
import { lessThan, subtract, add, Money, isPositive } from "@/lib/money";

enableLegendStateReact();

function usd(amount: number): Money {
  return { amount, currency: DEFAULT_CURRENCY };
}

export const DEFAULT_CURRENCY = "USD";
/*
type NodeMap =  { [id:string]: Node };
*/
function* traverse(nodes: NodeMap, nodeId: string, depth: number, parentId: string | null): Generator<UINode, void, unknown> {
  const currentNode = nodes[nodeId];

  console.log(`Traversing ${nodeId}`)
  console.log(currentNode);
  /*const usedBudget = currentNode.children.reduce((total, child) => {
    return total.add(nodes[child].budget);
  }, usd(0));

  currentNode.usedBudget = usedBudget;*/

  yield currentNode;

  if (
    currentNode.budgetType == "fixed" &&
    (currentNode.children.length > 0) &&
    (lessThan(currentNode.usedBudget, currentNode.budget))) {
    // Insert pseudo-item
    const id = uuidv4();
    yield {
      id,
      name: "Pseudo-intent",
      budget: subtract(currentNode.budget, currentNode.usedBudget),
      type: "pseudo",
      children: [],
      usedBudget: usd(0),
      agent: currentNode.agent,
      parent: currentNode.id,
      budgetType: "residual",
      depth: depth + 1
    }
  }

  for (const childId of currentNode.children) {
    yield* traverse(nodes, childId, depth + 1, currentNode.id);
  }
}

function recalculate(graph: ObservableObject<Graph>, id: string) {
  const node = graph.nodes[id];


  node.usedBudget.set(node.children.get().reduce((total, child) => {
    const isPseudo = graph.nodes[child].type.get() == "pseudo";
    return isPseudo ? total : add(total, graph.nodes[child].budget.get());
  }, usd(0)));

  if (node.budgetType.get() == "automatic") {
    node.budget.set(node.usedBudget.get());
  } else { // Fixed budget
    const excess = subtract(node.budget.get(), node.usedBudget.get());
    const pseudoItemId = node.children.find((childId) => graph.nodes[childId].type.get() == "pseudo");
    if (pseudoItemId !== undefined) {
      const pseudoItem = graph.nodes[pseudoItemId];
      if (!isPositive(excess) || node.children.length == 1) {
        node.children.filter(child => child.get() != pseudoItemId);
        pseudoItem.delete();
      }
      else {
        pseudoItem.budget.set(excess);
      }

    } else {
      if (isPositive(excess)) {
        const newPseudoItemId = uuidv4();
        graph.nodes[newPseudoItemId].set({
          id: newPseudoItemId,
          name: "Pseudo-intent",
          budget: excess,
          type: "pseudo",
          children: [],
          usedBudget: usd(0),
          agent: node.agent.get(),
          parent: node.id.get(),
          budgetType: "residual",
          depth: node.depth.get() + 1
        });
        node.children.unshift(newPseudoItemId);
      }
    }
  }

  const parentId = node.parent.get();
  if (typeof parentId == "string") {
    recalculate(graph, parentId);
  }
}

export function addNewItem(graph: ObservableObject<Graph>, parentId: string, type: NodeType,
  name: string, agent: string, budget: Money, budgetType: BudgetType) {
  const id = uuidv4();
  batch(() => {
    graph.nodes[id].set({
      id,
      name,
      agent,
      budget,
      children: [],
      type,
      budgetType,
      parent: parentId,
      usedBudget: usd(0),
      depth: graph.nodes[parentId].depth.get() + 1
    });
    if (parentId) {
      console.log("adding");
      graph.nodes[parentId].children.push(id);
    }
    recalculate(graph, parentId);
  });
}

function updateItem(graph: ObservableObject<Graph>, itemId: string, name: string, agent: string, budgetType: BudgetType, budget: Money) {
  graph.nodes[itemId].name.set(name);
  graph.nodes[itemId].agent.set(agent);
  graph.nodes[itemId].budgetType.set(budgetType);
  graph.nodes[itemId].budget.set(budget);
  recalculate(graph, itemId);
}

const Debug = observer(function Debug({ state }: { state: ObservableObject<State> }) {
  return <div className="col-span-full">{JSON.stringify(state.graph.nodes.get())}</div>
});

const TreeGrid = observer(function TreeGrid({ state }: { state: ObservableObject<State> }) {
  const addNew = (parentId: string) => {
    open(state.addNew, parentId);
  }

  const openEdit = (item: ObservableObject<UINode>) => {
    EditForm.open(state.edit, item);
  }
 
  const addNewHandler = function(parentId: string, name: string, agent: string, budgetType: BudgetType, budget: Money) {
     addNewItem(state.graph, parentId, "intent", name, agent, budget, budgetType) 
  }

  const editHandler = function(itemId: string, name:string, agent: string, budgetType: BudgetType, budget: Money) {
    updateItem(state.graph, itemId, name, agent, budgetType, budget);
  }
  
  const deleteHandler = function(id: string, parentId: string) {
    batch(() => {
     state.graph.nodes[parentId].children.set((children) => children.filter(v => v != id));
     state.graph.nodes[id].delete();
     recalculate(state.graph, parentId);
    });
  }



  return (
    <div className="grid gap-x-2 gap-y-1 grid-cols-4 pb-8">
      <TreeGridContext.Provider value={{ addNew, openEdit, deleteHandler, graph: state.graph }}>
        {(state.graph.rootNode.get() != null) ?
          <>
            <div className="font-medium">Name</div><div className="font-medium">Budget</div><div className="font-medium">Assigned to</div><div></div>
            <Row item={state.graph.nodes[state.graph.rootNode.get() as string]} />
          </>
          :
          <div className="col-span-full">
            <button>Add</button>
          </div>}
        <AddNewDialog state={state.addNew} addNewHandler={addNewHandler} />
        <Edit state={state.edit} onSave={editHandler}></Edit>
      </TreeGridContext.Provider>
    </div>
  );
});

export default TreeGrid;