export type CanonicalTxn = {
  date: string;            // YYYY-MM-DD
  amount: number;          // signed minor units (cents)
  currency: string;
  description: string;
  merchant?: string;
  notes?: string;
  pending: boolean;
  importHash: string;
  rawData: unknown;
};

export type ParseResult = {
  parsed: CanonicalTxn[];
  errors: { row: number; message: string; raw: unknown }[];
};

export type ParserId = "robinhood";

export type ParseOptions = {
  accountId: string;
  currency?: string;
};
