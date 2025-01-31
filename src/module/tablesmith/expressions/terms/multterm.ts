import TSExpression from '../tsexpression';
import { BaseMathTerm } from './basemathterm';
import TermCalc from './termcalc';

/**
 * MultTerm is used for "*" calculations.
 */
class MultTerm extends BaseMathTerm implements TermCalc {
  constructor(termA: TSExpression, termB: TSExpression) {
    super(termA, termB);
    super.termCalc = this;
  }

  calc(a: number, b: number): number {
    return a * b;
  }
  operator(): string {
    return '*';
  }
}

export default MultTerm;
