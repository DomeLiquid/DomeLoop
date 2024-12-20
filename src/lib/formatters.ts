import numeral from 'numeral';

class CustomNumberFormat extends Intl.NumberFormat {
  constructor(
    locale: string | string[] | undefined,
    options: Intl.NumberFormatOptions | undefined,
  ) {
    super(locale, options);
  }

  format(value: number | bigint) {
    if (value === 0) {
      return '-';
    } else {
      return super.format(value);
    }
  }
}

const groupedNumberFormatter = new CustomNumberFormat('en-US', {
  useGrouping: true,
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const numeralFormatter = (value: number) => {
  if (value < 0.0001) {
    return '0';
  } else {
    return numeral(value).format('0.0000a');
  }
};

const groupedNumberFormatterDyn = new Intl.NumberFormat('en-US', {
  useGrouping: true,
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
  signDisplay: 'auto',
});

const usdFormatterDyn = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 8,
  signDisplay: 'auto',
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatterDyn = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const clampedNumeralFormatter = (value: number | string) => {
  const valueNum = typeof value === 'string' ? Number(value) : value;
  if (valueNum === 0) {
    return '0';
  } else if (valueNum < 0.00000001) {
    return '< 0.00000001';
  } else if (valueNum < 1) {
    return valueNum.toFixed(8);
  } else {
    return numeral(valueNum).format('0.00a');
  }
};

const tokenPriceFormatter = (price: number | string) => {
  const priceNum = typeof price === 'string' ? Number(price) : price;
  const reformatNum = Number(priceNum.toFixed(8));

  if (reformatNum < 0.00000001) {
    return priceNum.toExponential(2);
  }

  const { minFractionDigits, maxFractionDigits } =
    reformatNum > 1
      ? { minFractionDigits: 0, maxFractionDigits: 2 }
      : reformatNum > 0.000001
        ? { minFractionDigits: 2, maxFractionDigits: 7 }
        : { minFractionDigits: 7, maxFractionDigits: 8 };

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: minFractionDigits,
    maximumFractionDigits: maxFractionDigits,
    signDisplay: 'auto',
  });

  return formatter.format(priceNum);
};

export {
  CustomNumberFormat,
  groupedNumberFormatter,
  groupedNumberFormatterDyn,
  numeralFormatter,
  clampedNumeralFormatter,
  percentFormatter,
  percentFormatterDyn,
  usdFormatter,
  usdFormatterDyn,
  tokenPriceFormatter,
};

export const HOURS_PER_YEAR = 365.25 * 24;
// ================ interest rate helpers ================

/**
 * Formula source: http://www.linked8.com/blog/158-apy-to-apr-and-apr-to-apy-calculation-methodologies
 *
 * @param apy {Number} APY (i.e. 0.06 for 6%)
 * @param compoundingFrequency {Number} Compounding frequency (times a year)
 * @returns {Number} APR (i.e. 0.0582 for APY of 0.06)
 */
const apyToApr = (apy: number, compoundingFrequency = HOURS_PER_YEAR) =>
  ((1 + apy) ** (1 / compoundingFrequency) - 1) * compoundingFrequency;

/**
 * Formula source: http://www.linked8.com/blog/158-apy-to-apr-and-apr-to-apy-calculation-methodologies
 *
 * @param apr {Number} APR (i.e. 0.0582 for 5.82%)
 * @param compoundingFrequency {Number} Compounding frequency (times a year)
 * @returns {Number} APY (i.e. 0.06 for APR of 0.0582)
 */
const aprToApy = (apr: number, compoundingFrequency = HOURS_PER_YEAR) =>
  (1 + apr / compoundingFrequency) ** compoundingFrequency - 1;

function calculateInterestFromApy(
  principal: number,
  durationInYears: number,
  apy: number,
): number {
  return principal * apy * durationInYears;
}

function calculateApyFromInterest(
  principal: number,
  durationInYears: number,
  interest: number,
): number {
  return interest / (principal * durationInYears);
}

export {
  apyToApr,
  aprToApy,
  calculateInterestFromApy,
  calculateApyFromInterest,
};
