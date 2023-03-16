import { observer, reactive } from "@legendapp/state/react";
import { ObservableObject } from "@legendapp/state";
import { Dialog, Transition } from "@headlessui/react";
import { TreeGridContext, TreeGridContextType, BudgetType } from "./State";
import { PrimaryButton, SecondaryButton } from "../Button";
import { useContext, Fragment } from "react";
import ItemForm, { ItemFormState, Schema } from "./ItemForm";
import { Money, fromDecimal } from "@/lib/money";

function moneyFromString(str: string): Money {
  return fromDecimal(parseFloat(str), "USD");
} 

export interface AddNewState {
  form: ItemFormState;
  open: boolean;
  parentId: string | null;
}

export function close(state: ObservableObject<AddNewState>) {
  state.open.set(false);
}

export function open(state: ObservableObject<AddNewState>, parentId: string | null) {
  state.open.set(true);
  state.form.inputs.set({name: "", retained: "", agent: "Unknown", budgetType: "automatic"});
  state.parentId.set(parentId);
}

const AddNewDialog = observer((
  { state, addNewHandler }:
  { state: ObservableObject<AddNewState>, addNewHandler: (parentId: string | null, name: string, agent: string, budgetType: BudgetType, budget: Money) => void}) => {
  const { graph } = useContext(TreeGridContext) as TreeGridContextType;
  const nodes = graph.nodes;
  
  const parentId = state.parentId.get();
  const parentNode = parentId !== null ? nodes[parentId].get() : null;

  const handleAddNew = () => {
    // TODO: refactor this into form-based validation
    const result = Schema.safeParse(state.form.inputs.get());
    if (result.success) {
      state.form.errors.set({});
      const budget = state.form.inputs.budgetType.get() == "automatic" ? moneyFromString("0") : moneyFromString(state.form.inputs.retained.get());
      addNewHandler(state.parentId.get(), state.form.inputs.name.get(), state.form.inputs.agent.get(), state.form.inputs.budgetType.get(), budget);
      close(state);
    } else {
      state.form.errors.set(result.error.flatten().fieldErrors);
    }
  };

  return (
    <Transition appear show={state.open.get()} as={Fragment}>
      <Dialog className="relative z-50" onClose={() => close(state)}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25 opacity-100"></div>
        </Transition.Child>
        <div className="fixed inset-0 flex items-center justify-center p-4 ">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all opacity-100 scale-100">
              <Dialog.Title className="font-medium text-lg">Add new budget item</Dialog.Title>
              <Dialog.Description className="text-sm">
                {parentNode &&
                <div>New budget item under <span className="italic">{parentNode?.name}</span></div>}
              </Dialog.Description>
             
             <ItemForm state={state.form} />

              <div className="mt-2 flex items-center gap-2 justify-end">
                <SecondaryButton onClick={() => { close(state); }}>Cancel</SecondaryButton>
                <PrimaryButton onClick={handleAddNew}>Add</PrimaryButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
});

export default AddNewDialog;