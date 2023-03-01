import tw from "tailwind-styled-components";

export const PrimaryButton = tw.button`inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed`
export const SecondaryButton = tw(PrimaryButton)`bg-gray-200 hover:bg-gray-300 text-gray-900`;