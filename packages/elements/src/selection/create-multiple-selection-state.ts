/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/bfce84fee12a027d9cbc38b43e1747e3e4b4b169/packages/@react-stately/selection/src/useMultipleSelectionState.ts
 */

import { access, MaybeAccessor, mergeDefaultProps } from "@kobalte/utils";
import { createEffect, createMemo, createSignal, mergeProps, on } from "solid-js";

import { createControllableSelectionSignal } from "./create-controllable-selection-signal";
import {
  DisabledBehavior,
  FocusStrategy,
  MultipleSelection,
  MultipleSelectionState,
  Selection,
  SelectionBehavior,
  SelectionType,
} from "./types";

export interface MultipleSelectionStateProps extends MultipleSelection {
  /** How multiple selection should behave in the collection. */
  selectionBehavior?: MaybeAccessor<SelectionBehavior | undefined>;

  /** Whether onSelectionChange should fire even if the new set of keys is the same as the last. */
  allowDuplicateSelectionEvents?: MaybeAccessor<boolean | undefined>;

  /** Whether `disabledKeys` applies to all interactions, or only selection. */
  disabledBehavior?: MaybeAccessor<DisabledBehavior | undefined>;
}

/**
 * Manages state for multiple selection and focus in a collection.
 */
export function createMultipleSelectionState(
  props: MultipleSelectionStateProps
): MultipleSelectionState {
  props = mergeDefaultProps(
    {
      selectionMode: "none",
      selectionBehavior: "toggle",
      disabledBehavior: "all",
    },
    props
  );

  const [isFocused, setFocused] = createSignal(false);
  const [focusedKey, _setFocusedKey] = createSignal<string>();
  const [childFocusStrategy, setChildFocusStrategy] = createSignal<FocusStrategy>("first");

  const selectedKeysProp = createMemo(() => {
    const selection = access(props.selectedKeys);

    if (!selection) {
      return;
    }

    return convertSelection(selection);
  });

  const defaultSelectedKeys = createMemo(() => {
    const defaultSelection = access(props.defaultSelectedKeys);

    if (!defaultSelection) {
      return new Selection();
    }

    return convertSelection(defaultSelection);
  });

  const [selectedKeys, _setSelectedKeys] = createControllableSelectionSignal({
    value: selectedKeysProp,
    defaultValue: defaultSelectedKeys,
    onChange: value => props.onSelectionChange?.(value),
  });

  const disabledKeysProp = createMemo(() => {
    const disabledKeys = access(props.disabledKeys);
    return disabledKeys ? new Set(disabledKeys) : new Set<string>();
  });

  const [selectionBehavior, setSelectionBehavior] = createSignal<SelectionBehavior>(
    access(props.selectionBehavior)!
  );

  const selectionMode = () => access(props.selectionMode)!;
  const disallowEmptySelection = () => access(props.disallowEmptySelection) ?? false;
  const disabledBehavior = () => access(props.disabledBehavior)!;

  const setFocusedKey = (key?: string, childFocusStrategy: FocusStrategy = "first") => {
    setChildFocusStrategy(childFocusStrategy);
    _setFocusedKey(key);
  };

  const setSelectedKeys = (keys: SelectionType) => {
    if (access(props.allowDuplicateSelectionEvents) || !isSameSelection(keys, selectedKeys())) {
      _setSelectedKeys(keys);
    }
  };

  // If the selectionBehavior prop is set to replace, but the current state is toggle (e.g. due to long press
  // to enter selection mode on touch), and the selection becomes empty, reset the selection behavior.
  createEffect(() => {
    const selection = selectedKeys();

    if (
      access(props.selectionBehavior) === "replace" &&
      selectionBehavior() === "toggle" &&
      typeof selection === "object" &&
      selection.size === 0
    ) {
      setSelectionBehavior("replace");
    }
  });

  // If the selectionBehavior prop changes, update the state as well.
  createEffect(() => {
    setSelectionBehavior(access(props.selectionBehavior) ?? "toggle");
  });

  return {
    selectionMode,
    disallowEmptySelection,
    disabledBehavior,
    selectionBehavior,
    setSelectionBehavior,
    isFocused,
    setFocused,
    focusedKey,
    childFocusStrategy,
    setFocusedKey,
    selectedKeys,
    setSelectedKeys,
    disabledKeys: disabledKeysProp,
  };
}

function convertSelection(
  selection: "all" | Iterable<string>,
  defaultValue?: Selection
): "all" | Selection | undefined {
  if (!selection) {
    return defaultValue;
  }

  return selection === "all" ? "all" : new Selection(selection);
}

function equalSets(setA: Set<any>, setB: Set<any>) {
  if (setA.size !== setB.size) {
    return false;
  }

  for (const item of setA) {
    if (!setB.has(item)) {
      return false;
    }
  }

  return true;
}

function isSameSelection(a: SelectionType, b: SelectionType): boolean {
  if (a === "all" && b === "all") {
    return true;
  }

  const isASet = typeof a === "object";
  const isBSet = typeof b === "object";

  return isASet && isBSet && equalSets(a, b);
}