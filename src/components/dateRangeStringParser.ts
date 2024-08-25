import { format, parse } from 'date-fns';
import { de } from 'date-fns/locale';

interface DateRange {
  from: string;
  to: string;
}

export type ValidRange = {
  state: 'valid';
  dateRange: DateRange;
};

export type InvalidRange = {
  state: 'invalidFormat';
  input: string;
};

export type InvalidFromDate = {
  state: 'invalidFrom';
  inputFrom: string;
};

export type InvalidToDate = {
  state: 'invalidTo';
  inputTo: string;
};

export type ToBeforeFrom = {
  state: 'toBeforeFrom';
};

export type OutOfRange = {
  state: 'outOfRange';
};

export type DateRangeValidationResult =
  | ValidRange
  | InvalidRange
  | InvalidFromDate
  | InvalidToDate
  | ToBeforeFrom
  | OutOfRange;

export type DateRangeStringParser = {
  parseRangeInput: (input: string) => DateRangeValidationResult;
  isRangeInputValid: (input: string) => string | boolean;
};

export function useDateRangePickerStringParser(
  lowerBound: Date,
  upperBound: Date,
): DateRangeStringParser {
  return {
    parseRangeInput: (input: string) =>
      parseRangeInput(input, lowerBound, upperBound),
    isRangeInputValid: (input: string) =>
      isRangeInputValid(input, lowerBound, upperBound),
  };
}

function parseRangeInput(
  input: string,
  lowerBound: Date,
  upperBound: Date,
): DateRangeValidationResult {
  const f = (d: Date) => format(d, 'P', { locale: de });

  const hasCorrectFormatRegex = /\s*(?<from>.*?)\s*\-\s*(?<to>.*?)\s*$/;
  const match = hasCorrectFormatRegex.test(input);

  if (!match) return { state: 'invalidFormat', input: input };

  const fromInput = hasCorrectFormatRegex.exec(input)?.[1] ?? '';
  const fromDate = parse(fromInput, 'P', new Date(), { locale: de });

  if (fromDate instanceof Date && isNaN(fromDate.getTime()))
    return { state: 'invalidFrom', inputFrom: fromInput };

  const toInput = hasCorrectFormatRegex.exec(input)?.[2] ?? '';
  const toDate = parse(toInput as string, 'P', new Date(), { locale: de });

  if (toDate instanceof Date && isNaN(toDate.getTime()))
    return { state: 'invalidTo', inputTo: toInput };

  if (fromDate > toDate) return { state: 'toBeforeFrom' };

  if (fromDate < lowerBound || toDate > upperBound)
    return { state: 'outOfRange' };

  return { state: 'valid', dateRange: { from: f(fromDate), to: f(toDate) } };
}

function isRangeInputValid(
  input: string,
  lowerBound: Date,
  upperBound: Date,
): string | boolean {
  const parsingResult = parseRangeInput(input, lowerBound, upperBound);

  if (parsingResult.state === 'invalidFormat') return 'Inkorrekte Eingabe.';

  if (parsingResult.state === 'invalidFrom') return 'Ungültiges Start Datum.';

  if (parsingResult.state === 'invalidTo') return 'Ungültiges Ende Datum.';

  if (parsingResult.state === 'toBeforeFrom')
    return 'Start muss vor Ende liegen.';

  if (parsingResult.state === 'outOfRange')
    return 'Mindestens ein Datum liegt ausserhalb des Gültigkeitsbereichs.';

  return true;
}
