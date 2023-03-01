import { observer, useComputed, For } from "@legendapp/state/react";
import { Fragment, useContext } from "react";
import { TreeGridContextType, UINode, TreeGridContext } from "./State";
import { ObservableObject } from "@legendapp/state";
import { SecondaryButton } from "../Button";
import tw from "tailwind-styled-components";

const DeleteButton = tw(SecondaryButton)`py-1 text-xs px-2`;
const AddButton = DeleteButton;
const EditButton = DeleteButton;

const Label = tw.div`text-[0.6rem] font-medium p-1 rounded text-gray-50 bg-gray-600 uppercase cursor-default`;

const budgetTypes: { [type: string]: string } = {
  "automatic": "Automatic",
  "fixed": "Fixed",
  "residual": "↖ Residual"
}

const Row = observer(({ item }: { item: ObservableObject<UINode> }) => {
  const node = item;
  const { depth, name, budget, agent, type, usedBudget, budgetType } = node.get();
  const symbol = budget.getCurrencyInfo().symbol;
  const { addNew, deleteHandler, openEdit } = (useContext(TreeGridContext) as TreeGridContextType);
  const pixelDepth = (depth * 10).toString();
  const budgetExceeded = usedBudget?.greaterThan(budget);
  const { graph } = useContext(TreeGridContext) as TreeGridContextType;

  //const children = useComputed(() => node.children.map(childId => { console.log(childId.get()); return graph.nodes[childId.get()].get() }))

  return (
    <Fragment>
      <div style={{ paddingLeft: `${pixelDepth}px` }} className={(type == "pseudo") ? "italic" : ""}>{name}</div>
      <div style={{ paddingLeft: `${pixelDepth}px` }} className="flex items-center gap-2">
        <div className={`${budgetExceeded ? "text-red-500" : ""} font-mono`}>{symbol}{budget.toString()}</div>
        <Label>{budgetTypes[budgetType]}</Label>
        <div>{usedBudget && budgetExceeded && `${symbol}${budget.subtract(usedBudget).toString()}`}</div>
      </div>
      <div style={{ paddingLeft: `${pixelDepth}px` }}>
        {agent ?? "Unknown"}
      </div>
      <div className="flex items-center gap-2">
        <EditButton disabled={node.type.get() == "pseudo"} onClick={() => openEdit(item)}>Edit</EditButton>
        <AddButton disabled={node.type.get() == "pseudo"} onClick={() => addNew(item.id.get())}>Add</AddButton>
        {(node.parent.get() !== null) && <DeleteButton disabled={node.type.get() == "pseudo"} onClick={() => deleteHandler(item.id.get(), item.parent.get() as string)}>Delete</DeleteButton>}
      </div>
      {(node.children.length > 0) &&
        (node.children.map((childId) => {
          return <Row key={graph.nodes[childId.get()].id.peek()} item={graph.nodes[childId.get()]} />
        }))
      }
      {/*<For each={children} item={Row} />*/}
    </Fragment>);
});

export default Row;