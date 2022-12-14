/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/3155e4db7eba07cf06525747ce0adb54c1e2a086/packages/@react-aria/switch/src/useSwitch.ts
 * https://github.com/adobe/react-spectrum/blob/3155e4db7eba07cf06525747ce0adb54c1e2a086/packages/@react-aria/toggle/src/useToggle.ts
 */

import { callHandler, combineProps, mergeDefaultProps, visuallyHiddenStyles } from "@kobalte/utils";
import { ComponentProps, JSX, splitProps } from "solid-js";

import { createFocusRing, createPress } from "../primitives";
import { useSwitchContext } from "./switch-context";

/**
 * The native html input that is visually hidden in the switch.
 */
export function SwitchInput(props: ComponentProps<"input">) {
  const context = useSwitchContext();

  props = mergeDefaultProps({ id: context.generateId("input") }, props);

  const [local, others] = splitProps(props, ["onChange"]);

  const { pressHandlers } = createPress({
    isDisabled: context.isDisabled,
  });

  const { focusRingHandlers } = createFocusRing({
    onFocusChange: value => context.setIsFocused(value),
    onFocusVisibleChange: value => context.setIsFocusVisible(value),
  });

  const ariaLabelledBy = () => {
    return (
      [
        context.ariaLabelledBy(),
        // If there is both an aria-label and aria-labelledby, add the input itself has an aria-labelledby
        context.ariaLabelledBy() != null && context.ariaLabel() != null ? others.id : undefined,
      ]
        .filter(Boolean)
        .join(" ") || undefined
    );
  };

  const onChange: JSX.EventHandlerUnion<HTMLInputElement, Event> = e => {
    callHandler(e, local.onChange);

    e.stopPropagation();

    const target = e.target as HTMLInputElement;

    context.setIsChecked(target.checked);

    // Unlike in React, inputs `checked` state can be out of sync with our toggle state.
    // for example a readonly `<input type="checkbox" />` is always "checkable".
    //
    // Also, even if an input is controlled (ex: `<input type="checkbox" checked={isChecked} />`,
    // clicking on the input will change its internal `checked` state.
    //
    // To prevent this, we need to force the input `checked` state to be in sync with the toggle state.
    target.checked = context.isChecked();
  };

  return (
    <input
      type="checkbox"
      role="switch"
      name={context.name()}
      value={context.value()}
      checked={context.isChecked()}
      required={context.isRequired()}
      disabled={context.isDisabled()}
      readonly={context.isReadOnly()}
      aria-label={context.ariaLabel()}
      aria-labelledby={ariaLabelledBy()}
      aria-describedby={context.ariaDescribedBy()}
      aria-errormessage={context.ariaErrorMessage()}
      aria-invalid={context.validationState() === "invalid" || undefined}
      aria-required={context.isRequired() || undefined}
      aria-disabled={context.isDisabled() || undefined}
      aria-readonly={context.isReadOnly() || undefined}
      onChange={onChange}
      {...combineProps({ style: visuallyHiddenStyles }, others, pressHandlers, focusRingHandlers)}
    />
  );
}
