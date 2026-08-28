export interface ContractDebtFormData {
    cusId: string;
    contactNo: string;
    limitId: string;
    lnContactNo: string;
    lnContactDate: string;
    lnAmt: number;
    lnDate: string;
    contractIntRate: number;
    actIntRate: number;
    reason: string;
    casaRate: number;
    maturityAmt: number;
    settDate: string;
    term: number;
    currency: string;
    purpose: string;
    intTerm: string;
    prinTerm: string;
    status: string;
    remainLimit?: number;
    note?: string;
    prepaymentNote?: string;
}

export interface ContractDebt {
    id?: string;
    cusId: string;
    cusCode?: string;
    contactNo: string;
    limitId: string;
    limitCode?: string;
    lnContactNo: string;
    lnContactDate: string;
    lnAmt: number;
    lnDate: string;
    contractIntRate: number;
    actIntRate: number;
    reason: string;
    casaRate: number;
    maturityAmt?: number;
    settDate?: string;
    term: number;
    currency: string;
    purpose: string;
    intTerm: string;
    prinTerm: string;
    status: string;
    createdDate?: string;
    note?: string;
    prepaymentNote?: string;
}
