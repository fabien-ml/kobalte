/*!
 * Portions of this file are based on code from react-spectrum.
 * Apache License Version 2.0, Copyright 2020 Adobe.
 *
 * Credits to the React Spectrum team:
 * https://github.com/adobe/react-spectrum/blob/15e101b74966bd5eb719c6529ce71ce57eaed430/packages/@react-aria/calendar/src/useCalendar.ts
 * https://github.com/adobe/react-spectrum/blob/15e101b74966bd5eb719c6529ce71ce57eaed430/packages/@react-stately/calendar/src/useCalendarState.ts
 */

import {
  CalendarDate,
  GregorianCalendar,
  isEqualDay,
  maxDate,
  minDate,
  toCalendar,
  toCalendarDate,
} from "@internationalized/date";
import { access, createPolymorphicComponent, mergeDefaultProps, RangeValue } from "@kobalte/utils";
import { Accessor, createEffect, createMemo, createSignal, mergeProps, splitProps } from "solid-js";

import { useLocale } from "../i18n";
import { createControllableSignal } from "../primitives";
import { CalendarRoot } from "./calendar-root";
import { createCalendarState, CreateCalendarStateProps } from "./create-calendar-state";
import { CalendarState, DateRange, DateValue, MappedDateValue, RangeCalendarState } from "./types";
import { alignCenter, constrainValue, isInvalid, previousAvailableDate } from "./utils";

export interface CalendarRangeOptions
  extends Omit<
    CreateCalendarStateProps,
    "value" | "defaultValue" | "onValueChange" | "selectionAlignment"
  > {
  /** The controlled selected date range of the calendar. */
  value?: DateRange;

  /**
   * The selected date range of the calendar when initially rendered.
   * Useful when you do not need to control the selected date range.
   */
  defaultValue?: DateRange;

  /** Event handler called when the selected date range changes. */
  onValueChange?: (selectedDate: RangeValue<MappedDateValue<DateValue>>) => void;

  /**
   * When combined with `isDateUnavailable`, determines whether non-contiguous ranges,
   * i.e. ranges containing unavailable dates, may be selected.
   */
  allowsNonContiguousRanges?: boolean;
}

/**
 * Displays one or more date grids and allows users to select a contiguous range of dates.
 */
export const CalendarRange = createPolymorphicComponent<"div", CalendarRangeOptions>(props => {
  const { locale: defaultLocale } = useLocale();

  props = mergeDefaultProps(
    {
      locale: () => defaultLocale(),
      visibleMonths: 1,
    },
    props
  );

  const [local, calendarProps, others] = splitProps(
    props,
    [
      "value",
      "defaultValue",
      "onValueChange",
      "allowsNonContiguousRanges",
      "locale",
      "visibleMonths",
      "minValue",
      "maxValue",
    ],
    [
      "createCalendar",
      "isDateUnavailable",
      "isDisabled",
      "isReadOnly",
      "autoFocus",
      "focusedValue",
      "defaultFocusedValue",
      "onFocusChange",
      "validationState",
    ]
  );

  const [selectedRange, setSelectedRange] = createControllableSignal<DateRange>({
    value: () => local.value,
    defaultValue: () => local.defaultValue,
    onChange: value => local.onValueChange?.(value),
  });

  const [anchorDate, setAnchorDateState] = createSignal<CalendarDate>();

  const [availableRange, setAvailableRange] = createSignal<RangeValue<DateValue | undefined>>();

  const [isDragging, setDragging] = createSignal(false);

  const alignment: Accessor<"center" | "start"> = createMemo(() => {
    const visibleDuration = { months: access(local.visibleMonths) };
    const value = selectedRange();

    if (value && value.start && value.end) {
      const start = alignCenter(
        toCalendarDate(value.start),
        visibleDuration,
        access(local.locale)!,
        min(),
        max()
      );

      const end = start.add(visibleDuration).subtract({ days: 1 });

      if (value.end.compare(end) > 0) {
        return "start";
      }
    }

    return "center";
  });

  const min = createMemo(() => {
    const minValue = access(local.minValue);
    const rangeStart = availableRange()?.start;

    return minValue && rangeStart && maxDate(minValue, rangeStart);
  });

  const max = createMemo(() => {
    const maxValue = access(local.maxValue);
    const rangeEnd = availableRange()?.end;

    return maxValue && rangeEnd && minDate(maxValue, rangeEnd);
  });

  const createCalendarStateProps = mergeProps(calendarProps, {
    value: () => selectedRange()?.start,
    locale: () => access(local.locale)!,
    visibleMonths: () => access(local.visibleMonths),
    minValue: min,
    maxValue: max,
    selectionAlignment: alignment,
  } as CreateCalendarStateProps);

  const calendar = createCalendarState(createCalendarStateProps);

  const updateAvailableRange = (date: CalendarDate | undefined) => {
    if (date && calendarProps.isDateUnavailable && !local.allowsNonContiguousRanges) {
      setAvailableRange(() => ({
        start: nextUnavailableDate(date, calendar, -1),
        end: nextUnavailableDate(date, calendar, 1),
      }));
    } else {
      setAvailableRange(undefined);
    }
  };

  let lastVisibleRange = calendar.visibleRange();

  // If the visible range changes, we need to update the available range.
  createEffect(() => {
    const visibleRange = calendar.visibleRange();

    if (
      !isEqualDay(visibleRange.start, lastVisibleRange.start) ||
      !isEqualDay(visibleRange.end, lastVisibleRange.end)
    ) {
      updateAvailableRange(anchorDate());
      lastVisibleRange = calendar.visibleRange();
    }
  });

  const setAnchorDate = (date: CalendarDate | undefined) => {
    if (date) {
      setAnchorDateState(date);
      updateAvailableRange(date);
    } else {
      setAnchorDateState(undefined);
      updateAvailableRange(undefined);
    }
  };

  const highlightedRange = createMemo(() => {
    const anchor = anchorDate();
    const value = selectedRange();

    if (anchor) {
      return makeRange(anchor, calendar.focusedDate());
    } else if (value) {
      return makeRange(value.start, value.end);
    }
  });

  const selectDate = (newDate: CalendarDate) => {
    if (access(calendarProps.isReadOnly)) {
      return;
    }

    let date: CalendarDate | undefined = constrainValue(newDate, min(), max());
    date = previousAvailableDate(
      date,
      calendar.visibleRange().start,
      calendarProps.isDateUnavailable
    );

    if (!date) {
      return;
    }

    const anchor = anchorDate();
    const value = selectedRange();

    if (!anchor) {
      setAnchorDate(date);
    } else {
      const range = makeRange(anchor, date);

      if (range) {
        setSelectedRange({
          start: convertValue(range.start, value?.start),
          end: convertValue(range.end, value?.end),
        });
      }

      setAnchorDate(undefined);
    }
  };

  const isInvalidSelection = createMemo(() => {
    const anchor = anchorDate();
    const value = selectedRange();
    const isDateUnavailable = calendarProps.isDateUnavailable;

    if (!value || anchor) {
      return false;
    }

    if (isDateUnavailable && (isDateUnavailable(value.start) || isDateUnavailable(value.end))) {
      return true;
    }

    const minValue = access(local.minValue);
    const maxValue = access(local.maxValue);

    return isInvalid(value.start, minValue, maxValue) || isInvalid(value.end, minValue, maxValue);
  });

  const validationState = () => {
    return access(calendarProps.validationState) || (isInvalidSelection() ? "invalid" : undefined);
  };

  const state = mergeProps(calendar, {
    value: () => selectedRange(),
    setValue: setSelectedRange,
    anchorDate,
    setAnchorDate,
    highlightedRange,
    validationState,
    selectFocusedDate() {
      selectDate(calendar.focusedDate());
    },
    selectDate,
    highlightDate(date) {
      if (anchorDate()) {
        calendar.setFocusedDate(date);
      }
    },
    isSelected(date) {
      const highlighted = highlightedRange();

      return (
        highlighted != null &&
        date.compare(highlighted.start) >= 0 &&
        date.compare(highlighted.end) <= 0 &&
        !calendar.isCellDisabled(date) &&
        !calendar.isCellUnavailable(date)
      );
    },
    isInvalid(date) {
      return (
        calendar.isInvalid(date) || isInvalid(date, availableRange()?.start, availableRange()?.end)
      );
    },
    isDragging,
    setDragging,
  } as Partial<RangeCalendarState>) as RangeCalendarState;

  return <CalendarRoot state={state} isDisabled={access(calendarProps.isDisabled)} {...others} />;
});

function makeRange(
  start: DateValue | undefined,
  end: DateValue | undefined
): RangeValue<CalendarDate> | undefined {
  if (!start || !end) {
    return undefined;
  }

  if (end.compare(start) < 0) {
    [start, end] = [end, start];
  }

  return { start: toCalendarDate(start), end: toCalendarDate(end) };
}

function convertValue(newValue: CalendarDate, oldValue: DateValue | undefined) {
  // The display calendar should not have any effect on the emitted value.
  // Emit dates in the same calendar as the original value, if any, otherwise gregorian.
  newValue = toCalendar(newValue, oldValue?.calendar || new GregorianCalendar());

  // Preserve time if the input value had one.
  if (oldValue && "hour" in oldValue) {
    return oldValue.set(newValue);
  }

  return newValue;
}

function nextUnavailableDate(anchorDate: CalendarDate, state: CalendarState, dir: number) {
  let nextDate = anchorDate.add({ days: dir });

  while (
    (dir < 0
      ? nextDate.compare(state.visibleRange().start) >= 0
      : nextDate.compare(state.visibleRange().end) <= 0) &&
    !state.isCellUnavailable(nextDate)
  ) {
    nextDate = nextDate.add({ days: dir });
  }

  if (state.isCellUnavailable(nextDate)) {
    return nextDate.add({ days: -dir });
  }

  return undefined;
}