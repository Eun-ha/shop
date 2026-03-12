"use client";

import { useReducer } from "react";
import type { Order, ShippingAddress } from "@/lib/mock-db";

type CheckoutState = {
  address: ShippingAddress;
  error: string;
  success: string;
  ordered: Order | null;
  submitting: boolean;
};

type Action =
  | { type: "SET_ADDRESS_FIELD"; field: keyof ShippingAddress; value: string }
  | { type: "RESET_MESSAGES" }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_ERROR"; message: string }
  | { type: "SUBMIT_SUCCESS"; message: string; order: Order | null };

const initialState: CheckoutState = {
  address: {
    name: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
  },
  error: "",
  success: "",
  ordered: null,
  submitting: false,
};

function reducer(state: CheckoutState, action: Action): CheckoutState {
  switch (action.type) {
    case "SET_ADDRESS_FIELD":
      return {
        ...state,
        address: { ...state.address, [action.field]: action.value },
      };
    case "RESET_MESSAGES":
      return { ...state, error: "", success: "" };
    case "SUBMIT_START":
      return { ...state, submitting: true, error: "", success: "" };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, error: action.message };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        error: "",
        success: action.message,
        ordered: action.order,
      };
    default:
      return state;
  }
}

export function useCheckoutState() {
  const [state, dispatch] = useReducer(reducer, initialState);

  return {
    ...state,
    setAddressField: (field: keyof ShippingAddress, value: string) => dispatch({ type: "SET_ADDRESS_FIELD", field, value }),
    resetMessages: () => dispatch({ type: "RESET_MESSAGES" }),
    startSubmit: () => dispatch({ type: "SUBMIT_START" }),
    setSubmitError: (message: string) => dispatch({ type: "SUBMIT_ERROR", message }),
    setSubmitSuccess: (message: string, order: Order | null) => dispatch({ type: "SUBMIT_SUCCESS", message, order }),
  };
}
