import { RadioGroup } from "@kobalte/core";
import { createSignal, For, Show } from "solid-js";

import style from "./radio-group.module.css";

export function BasicExample() {
  return (
    <RadioGroup class={style["radio-group"]}>
      <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
      <div class={style["radio-group__items"]}>
        <For each={["Apple", "Orange", "Watermelon"]}>
          {fruit => (
            <RadioGroup.Item value={fruit} class={style["radio"]}>
              <RadioGroup.ItemInput />
              <RadioGroup.ItemControl class={style["radio__control"]}>
                <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
            </RadioGroup.Item>
          )}
        </For>
      </div>
    </RadioGroup>
  );
}

export function DefaultValueExample() {
  return (
    <RadioGroup class={style["radio-group"]} defaultValue="Orange">
      <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
      <div class={style["radio-group__items"]}>
        <For each={["Apple", "Orange", "Watermelon"]}>
          {fruit => (
            <RadioGroup.Item value={fruit} class={style["radio"]}>
              <RadioGroup.ItemInput />
              <RadioGroup.ItemControl class={style["radio__control"]}>
                <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
            </RadioGroup.Item>
          )}
        </For>
      </div>
    </RadioGroup>
  );
}

export function ControlledExample() {
  const [value, setValue] = createSignal("Orange");

  return (
    <>
      <RadioGroup class={style["radio-group"]} value={value()} onValueChange={setValue}>
        <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
        <div class={style["radio-group__items"]}>
          <For each={["Apple", "Orange", "Watermelon"]}>
            {fruit => (
              <RadioGroup.Item value={fruit} class={style["radio"]}>
                <RadioGroup.ItemInput />
                <RadioGroup.ItemControl class={style["radio__control"]}>
                  <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
                </RadioGroup.ItemControl>
                <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
              </RadioGroup.Item>
            )}
          </For>
        </div>
      </RadioGroup>
      <p class="not-prose text-sm mt-4">Your favorite fruit is: {value()}.</p>
    </>
  );
}

export function DescriptionExample() {
  return (
    <RadioGroup class={style["radio-group"]}>
      <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
      <div class={style["radio-group__items"]}>
        <For each={["Apple", "Orange", "Watermelon"]}>
          {fruit => (
            <RadioGroup.Item value={fruit} class={style["radio"]}>
              <RadioGroup.ItemInput />
              <RadioGroup.ItemControl class={style["radio__control"]}>
                <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
            </RadioGroup.Item>
          )}
        </For>
      </div>
      <RadioGroup.Description class={style["radio-group__description"]}>
        Choose the fruit you like the most.
      </RadioGroup.Description>
    </RadioGroup>
  );
}

export function ErrorMessageExample() {
  const [value, setValue] = createSignal("Orange");

  return (
    <RadioGroup
      class={style["radio-group"]}
      value={value()}
      onValueChange={setValue}
      validationState={value() !== "Apple" ? "invalid" : "valid"}
    >
      <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
      <div class={style["radio-group__items"]}>
        <For each={["Apple", "Orange", "Watermelon"]}>
          {fruit => (
            <RadioGroup.Item value={fruit} class={style["radio"]}>
              <RadioGroup.ItemInput />
              <RadioGroup.ItemControl class={style["radio__control"]}>
                <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
              </RadioGroup.ItemControl>
              <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
            </RadioGroup.Item>
          )}
        </For>
      </div>
      <RadioGroup.ErrorMessage class={style["radio-group__error-message"]}>
        Hmm, I prefer apples.
      </RadioGroup.ErrorMessage>
    </RadioGroup>
  );
}

export function HTMLFormExample() {
  let formRef: HTMLFormElement | undefined;

  const onSubmit = (e: SubmitEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const formData = new FormData(formRef);

    alert(JSON.stringify(Object.fromEntries(formData), null, 2));
  };

  return (
    <form ref={formRef} onSubmit={onSubmit} class="flex flex-col items-center space-y-6">
      <RadioGroup class={style["radio-group"]} name="favorite-fruit">
        <RadioGroup.Label class={style["radio-group__label"]}>Favorite fruit</RadioGroup.Label>
        <div class={style["radio-group__items"]}>
          <For each={["Apple", "Orange", "Watermelon"]}>
            {fruit => (
              <RadioGroup.Item value={fruit} class={style["radio"]}>
                <RadioGroup.ItemInput />
                <RadioGroup.ItemControl class={style["radio__control"]}>
                  <RadioGroup.ItemIndicator class={style["radio__indicator"]} />
                </RadioGroup.ItemControl>
                <RadioGroup.ItemLabel class={style["radio__label"]}>{fruit}</RadioGroup.ItemLabel>
              </RadioGroup.Item>
            )}
          </For>
        </div>
      </RadioGroup>
      <div class="flex space-x-2">
        <button type="reset" class="kb-button">
          Reset
        </button>
        <button class="kb-button-primary">Submit</button>
      </div>
    </form>
  );
}
