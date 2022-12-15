/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/6b51339cca0b8344507d3c8e81e7ad05d6e75f9b/packages/@react-aria/tabs/src/useTabList.ts
 */

import { combineProps, createPolymorphicComponent, mergeDefaultProps } from "@kobalte/utils";
import { splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import { useLocale } from "../i18n";
import { createFocusRing } from "../primitives";
import { createSelectableCollection } from "../selection";
import { useTabsContext } from "./tabs-context";
import { TabsKeyboardDelegate } from "./tabs-keyboard-delegate";

/**
 * Contains the tabs that are aligned along the edge of the active tab panel.
 */
export const TabList = createPolymorphicComponent<"div">(props => {
  let ref: HTMLElement | undefined;

  const context = useTabsContext();

  props = mergeDefaultProps({ as: "div" }, props);

  const [local, others] = splitProps(props, ["as"]);

  const locale = useLocale();

  const delegate = new TabsKeyboardDelegate(
    () => context.listState().collection(),
    () => locale().direction,
    () => context.orientation()
  );

  const selectableCollection = createSelectableCollection(
    {
      selectionManager: () => context.listState().selectionManager(),
      keyboardDelegate: () => delegate,
      selectOnFocus: () => context.activationMode() === "automatic",
      disallowEmptySelection: true,
    },
    () => ref
  );

  const { isFocused, isFocusVisible, focusRingHandlers } = createFocusRing({
    within: true,
  });

  return (
    <Dynamic
      component={local.as}
      role="tablist"
      aria-orientation={context.orientation()}
      data-orientation={context.orientation()}
      data-focus={isFocused() ? "" : undefined}
      data-focus-visible={isFocusVisible() ? "" : undefined}
      {...combineProps(
        { ref: el => (ref = el) },
        others,
        selectableCollection.handlers,
        focusRingHandlers
      )}
    />
  );
});