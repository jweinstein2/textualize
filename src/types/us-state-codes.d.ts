declare module 'us-state-codes' {
  export function getStateNameByStateCode(stateCode: string): string | null;
  export function getStateCodeByStateName(stateName: string): string | null;
  export function getAllStateCodes(): string[];
  export function getAllStateNames(): string[];
} 