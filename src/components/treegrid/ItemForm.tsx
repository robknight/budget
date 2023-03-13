import { z } from "zod";
import { observer } from "@legendapp/state/react";
import { ObservableObject } from "@legendapp/state";
import { Legend } from "@legendapp/state/react-components";
import { Transition } from "@headlessui/react";
import { useContext, Fragment } from "react";
import { DEFAULT_CURRENCY } from "../TreeGrid";
import CurrencyInput from 'react-currency-input-field';
import { getCurrencyInfo } from "@/lib/money";

export const Schema = z.object({
  name: z.string().min(1),
  retained: z.string(),
  agent: z.string().min(1),
  budgetType: z.enum(["fixed", "automatic", "residual"]),
}).refine(data => data.budgetType == "automatic" || !isNaN(parseFloat(data.retained)),
  { message: "Please provide a budget amount", path: ["retained"] }
).refine(data => data.budgetType == "automatic" || parseFloat(data.retained) > 0,
  { message: "Budget must be greater than zero", path: ["retained"] }
);

type ItemForm = z.infer<typeof Schema>;

export interface ItemFormState {
  inputs: ItemForm;
  errors: Errors,
}

type Errors = { [name: string]: string[] };

export interface ItemFormState {
  inputs: ItemForm;
  errors: Errors,
}

const ErrorMessage = observer(({ errors, name }: { errors: ObservableObject<Errors>, name: string }) => {
  if (!errors || !errors[name]) {
    return null;
  }

  return <div className="text-sm text-red-600 py-1">{errors[name][0]}</div>;
});

const ItemForm = observer(({ state }: { state: ObservableObject<ItemFormState> }) => {
  return (
    <div className="py-2">
      <div className="mb-2">
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
        <Legend.input value$={state.inputs.name} type="text" name="name" id="name" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        <ErrorMessage errors={state.errors} name="name" />
      </div>
      {/*<div className="mb-2">
                  <label htmlFor="agent" className="block text-sm font-medium text-gray-700">Agent</label>
                  <Legend.input value$={state.inputs.agent} type="text" name="agent" id="agent" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
                  <ErrorMessage errors={state.errors} name="agent" />
  </div>*/}
      <div className="mb-2">
        <label htmlFor="budget-type" className="block text-sm font-medium text-gray-700">
          Budget allocation
        </label>
        <Legend.select value$={state.inputs.budgetType} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
          <option value="automatic">Automatic</option>
          <option value="fixed">Fixed</option>
        </Legend.select>
      </div>

      <Transition appear show={state.inputs.budgetType.get() == "fixed"} as={Fragment}>
        <div className="mb-2">
          <label htmlFor="retained" className="block text-sm font-medium text-gray-700">Budget</label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm text-gray-500">{getCurrencyInfo(DEFAULT_CURRENCY).symbol}</span>
            <CurrencyInput
              className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              id="retained"
              name="retained"
              placeholder="Please enter a number"
              decimalsLimit={2}
              allowNegativeValue={false}
              prefix={""}
              value={state.inputs.retained?.get()}
              onValueChange={(value) => state.inputs.retained?.set(value ?? "")}
            />
          </div>
          <ErrorMessage errors={state.errors} name="retained" />
        </div>
      </Transition>


    </div>

  );
});

export default ItemForm;