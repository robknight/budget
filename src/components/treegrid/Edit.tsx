import { ObservableObject } from "@legendapp/state";
import { observer } from "@legendapp/state/react";
import ItemForm, { ItemFormState, Schema } from "./ItemForm";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { UINode, BudgetType } from "./State";
import { PrimaryButton, SecondaryButton } from "../Button";
import { Money } from "ts-money";

function moneyFromString(str: string): Money {
  return Money.fromDecimal(parseFloat(str), "USD");
} 

export interface EditState {
  open: boolean;
  form: ItemFormState;
  itemId: string;
}

export function close(state: ObservableObject<EditState>) {
  state.open.set(false);
}

export function open(state: ObservableObject<EditState>, item: ObservableObject<UINode>) {
  state.open.set(true);
  state.itemId.set(item.id.get());
  state.form.set({ inputs: {}, errors: {} } as ItemFormState);
  state.form.inputs.set({name: item.name.get(), retained: item.budget.get().toString(), agent: "Unknown", budgetType: item.budgetType.get()});
}

const EditDialog = observer(({ state, onSave }: { state: ObservableObject<EditState>, onSave: (id: string, name: string, agent: string, budgetType: BudgetType, budget: Money ) => void }) => {
  const saveHandler = () => {
    const result = Schema.safeParse(state.form.inputs.get());
    console.log(result);
    if (result.success) {
      state.form.errors.set({});
      const budget = state.form.inputs.budgetType.get() == "automatic" ? moneyFromString("0") : moneyFromString(state.form.inputs.retained.get());
      onSave(state.itemId.get(), state.form.inputs.name.get(), state.form.inputs.agent.get(), state.form.inputs.budgetType.get(), budget);
      close(state);
    } else {
      state.form.errors.set(result.error.flatten().fieldErrors);
      console.log(state.form.errors.get());
    }
  
  }
  
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
              <Dialog.Title className="font-medium text-lg">Edit budget item</Dialog.Title>
              <Dialog.Description className="text-sm"></Dialog.Description>

              <ItemForm state={state.form} />

              <div className="mt-2 flex items-center gap-2 justify-end">
                <SecondaryButton onClick={() => { close(state); }}>Cancel</SecondaryButton>
                <PrimaryButton onClick={() => saveHandler()}>Save</PrimaryButton>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
});

export default EditDialog;