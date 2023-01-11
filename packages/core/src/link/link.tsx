/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/b35d5c02fe900badccd0cf1a8f23bb593419f238/packages/@react-aria/link/src/useLink.ts
 */

import {
  callHandler,
  combineProps,
  createPolymorphicComponent,
  mergeDefaultProps,
} from "@kobalte/utils";
import { JSX, onMount, splitProps } from "solid-js";
import { Dynamic } from "solid-js/web";

import {
  CREATE_PRESS_PROP_NAMES,
  createFocusRing,
  createHover,
  createPress,
  CreatePressProps,
  createTagName,
} from "../primitives";
import { useRequiredTypography } from "../text";

export interface LinkOptions extends CreatePressProps {
  /**
   * Whether the link is disabled.
   * Native navigation will be disabled, and the link will be exposed as disabled to assistive technology.
   */
  isDisabled?: boolean;
  /**
   * Require the link to be embedded within a parent `Text` component.
   */
  requireParentText?: boolean;
}

/**
 * Link allows a user to navigate to another page or resource within a web page or application.
 */
export const Link = createPolymorphicComponent<"a", LinkOptions>(props => {
  let ref: HTMLAnchorElement | undefined;

  props = mergeDefaultProps({ as: "a" }, props);

  const [local, createPressProps, others] = splitProps(
    props,
    ["as", "isDisabled", "onClick", "requireParentText"],
    CREATE_PRESS_PROP_NAMES
  );

  onMount(() => {
    if (local.requireParentText) {
      useRequiredTypography("Link");
    }
  });

  const { isPressed, pressHandlers } = createPress<HTMLAnchorElement>(createPressProps);

  const { isHovered, hoverHandlers } = createHover({
    isDisabled: () => local.isDisabled,
  });

  const { isFocused, isFocusVisible, focusRingHandlers } = createFocusRing();

  const tagName = createTagName(
    () => ref,
    () => local.as || "a"
  );

  const onClick: JSX.EventHandlerUnion<HTMLAnchorElement, MouseEvent> = e => {
    if (local.onClick) {
      callHandler(e, local.onClick);
      console.warn("[kobalte]: use `onPress` instead of `onClick` for handling click interactions");
    }
  };

  return (
    <Dynamic
      component={local.as}
      role={tagName() !== "a" ? "link" : undefined}
      tabIndex={tagName() !== "a" && !local.isDisabled ? 0 : undefined}
      aria-disabled={local.isDisabled ? true : undefined}
      data-disabled={local.isDisabled ? "" : undefined}
      data-hover={isHovered() ? "" : undefined}
      data-focus={isFocused() ? "" : undefined}
      data-focus-visible={isFocusVisible() ? "" : undefined}
      data-active={isPressed() ? "" : undefined}
      {...combineProps(
        { ref: el => (ref = el), onClick },
        others,
        pressHandlers,
        hoverHandlers,
        focusRingHandlers
      )}
    />
  );
});
