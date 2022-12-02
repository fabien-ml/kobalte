/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/bfce84fee12a027d9cbc38b43e1747e3e4b4b169/packages/@react-stately/selection/src/Selection.ts
 * https://github.com/adobe/react-spectrum/blob/bfce84fee12a027d9cbc38b43e1747e3e4b4b169/packages/@react-stately/selection/src/types.ts
 * https://github.com/adobe/react-spectrum/blob/bfce84fee12a027d9cbc38b43e1747e3e4b4b169/packages/@react-types/shared/src/selection.d.ts
 */

import { MaybeAccessor } from "@kobalte/utils";
import { Accessor } from "solid-js";

import { PressEvent } from "../primitives";

export type SelectionMode = "none" | "single" | "multiple";
export type SelectionBehavior = "toggle" | "replace";
export type FocusStrategy = "first" | "last";
export type DisabledBehavior = "selection" | "all";
export type SelectionType = "all" | Set<string>;

export interface SingleSelection {
  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: MaybeAccessor<boolean | undefined>;

  /** The currently selected key in the collection (controlled). */
  selectedKey?: MaybeAccessor<string | undefined>;

  /** The initial selected key in the collection (uncontrolled). */
  defaultSelectedKey?: MaybeAccessor<string | undefined>;

  /** Handler that is called when the selection changes. */
  onSelectionChange?: (key: string) => any;
}

export interface MultipleSelection {
  /** The type of selection that is allowed in the collection. */
  selectionMode?: MaybeAccessor<SelectionMode | undefined>;

  /** Whether the collection allows empty selection. */
  disallowEmptySelection?: MaybeAccessor<boolean | undefined>;

  /** The currently selected keys in the collection (controlled). */
  selectedKeys?: MaybeAccessor<"all" | Iterable<string> | undefined>;

  /** The initial selected keys in the collection (uncontrolled). */
  defaultSelectedKeys?: MaybeAccessor<"all" | Iterable<string> | undefined>;

  /** Handler that is called when the selection changes. */
  onSelectionChange?: (keys: SelectionType) => any;

  /** The currently disabled keys in the collection (controlled). */
  disabledKeys?: MaybeAccessor<Iterable<string> | undefined>;
}

/**
 * A Selection is a special Set containing Keys, which also has an anchor
 * and current selected key for use when range selecting.
 */
export class Selection extends Set<string> {
  anchorKey?: string;
  currentKey?: string;

  constructor(keys?: Iterable<string> | Selection, anchorKey?: string, currentKey?: string) {
    super(keys);
    if (keys instanceof Selection) {
      this.anchorKey = anchorKey || keys.anchorKey;
      this.currentKey = currentKey || keys.currentKey;
    } else {
      this.anchorKey = anchorKey;
      this.currentKey = currentKey;
    }
  }
}

export interface FocusState {
  /** Whether the collection is currently focused. */
  isFocused: Accessor<boolean>;

  /** The current focused key in the collection. */
  focusedKey: Accessor<string | undefined>;

  /** Whether the first or last child of the focused key should receive focus. */
  childFocusStrategy: Accessor<FocusStrategy>;

  /** Sets whether the collection is focused. */
  setFocused(isFocused: boolean): void;

  /**
   * Sets the focused key, and optionally,
   * whether the first or last child of that key should receive focus.
   */
  setFocusedKey(key?: string, child?: FocusStrategy): void;
}

export interface SingleSelectionState extends FocusState {
  /** Whether the collection allows empty selection. */
  disallowEmptySelection: Accessor<boolean | undefined>;

  /** The currently selected key in the collection. */
  selectedKey: Accessor<string>;

  /** Sets the selected key in the collection. */
  setSelectedKey(key: string): void;
}

export interface MultipleSelectionState extends FocusState {
  /** The type of selection that is allowed in the collection. */
  selectionMode: Accessor<SelectionMode>;

  /** The selection behavior for the collection. */
  selectionBehavior: Accessor<SelectionBehavior>;

  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;

  /** Whether the collection allows empty selection. */
  disallowEmptySelection: Accessor<boolean>;

  /** The currently selected keys in the collection. */
  selectedKeys: Accessor<SelectionType>;

  /** Sets the selected keys in the collection. */
  setSelectedKeys(keys: SelectionType): void;

  /** The currently disabled keys in the collection. */
  disabledKeys: Accessor<Set<string>>;

  /** Whether `disabledKeys` applies to selection, actions, or both. */
  disabledBehavior: Accessor<DisabledBehavior>;
}

export interface MultipleSelectionManager extends FocusState {
  /** The type of selection that is allowed in the collection. */
  selectionMode: Accessor<SelectionMode>;

  /** The selection behavior for the collection. */
  selectionBehavior: Accessor<SelectionBehavior>;

  /** Whether the collection allows empty selection. */
  disallowEmptySelection: Accessor<boolean | undefined>;

  /** The currently selected keys in the collection. */
  selectedKeys: Accessor<Set<string>>;

  /** Whether the selection is empty. */
  isEmpty: Accessor<boolean>;

  /** Whether all items in the collection are selected. */
  isSelectAll: Accessor<boolean>;

  /** The first selected key in the collection. */
  firstSelectedKey: Accessor<string | undefined>;

  /** The last selected key in the collection. */
  lastSelectedKey: Accessor<string | undefined>;

  /** The currently disabled keys in the collection. */
  disabledKeys: Accessor<Set<string>>;

  /** Whether `disabledKeys` applies to selection, actions, or both. */
  disabledBehavior: Accessor<DisabledBehavior>;

  /** Returns whether a key is selected. */
  isSelected(key: string): boolean;

  /** Returns whether the current selection is equal to the given selection. */
  isSelectionEqual(selection: Set<string>): boolean;

  /** Extends the selection to the given key. */
  extendSelection(toKey: string): void;

  /** Toggles whether the given key is selected. */
  toggleSelection(key: string): void;

  /** Replaces the selection with only the given key. */
  replaceSelection(key: string): void;

  /** Replaces the selection with the given keys. */
  setSelectedKeys(keys: Iterable<string>): void;

  /** Selects all items in the collection. */
  selectAll(): void;

  /** Removes all keys from the selection. */
  clearSelection(): void;

  /** Toggles between select all and an empty selection. */
  toggleSelectAll(): void;

  /**
   * Toggles, replaces, or extends selection to the given key depending
   * on the pointer event and collection's selection mode.
   */
  select(key: string, e?: PressEvent | PointerEvent): void;

  /** Returns whether the given key can be selected. */
  canSelectItem(key: string): boolean;

  /**
   * Returns whether the given key is non-interactive,
   * i.e. both selection and actions are disabled.
   */
  isDisabled(key: string): boolean;

  /** Sets the selection behavior for the collection. */
  setSelectionBehavior(selectionBehavior: SelectionBehavior): void;
}