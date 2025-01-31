import TSGroup from '../tsgroup';
import { evalcontext } from './evaluationcontextinstance';
import CallSplitter from './callsplitter';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Class representing a variable Set expression.
 */
class TSVariableSetExpression implements TSExpression {
  varNameExpression: TSExpression;
  call: { tablename: string; variablename: string };
  type: string;
  valueExpression: TSExpression;
  constructor(varNameExpression: TSExpression, type: string, valueExpression: TSExpression) {
    this.varNameExpression = varNameExpression;
    this.type = type;
    this.valueExpression = valueExpression;
    this.call = { tablename: '', variablename: '' };
  }

  evaluate(): TSExpressionResult {
    const evaluated = this.varNameExpression.evaluate();
    this.call = CallSplitter.forVariable().split(evaluated.asString());
    const value = this.valueExpression.evaluate();
    const currentValue = evalcontext.getVar(this.call.tablename, this.call.variablename);
    switch (this.type) {
      case '=':
        this.evaluateSet(currentValue, value);
        break;
      case '+':
        this.evaluatePlus(currentValue, value);
        break;
      case '-':
        this.evaluateMinus(currentValue, value);
        break;
      case '*':
        this.evaluateMult(currentValue, value);
        break;
      case '/':
        this.evaluateDiv(currentValue, value);
        break;
      case '\\':
        this.evaluateDivRound(currentValue, value);
        break;
      case '&':
        this.evaluateAppendText(currentValue, value);
        break;
      case '<':
        this.evaluateMinimumBoundary(currentValue, value);
        break;
      case '>':
        this.evaluateMaximumBoundary(currentValue, value);
        break;
      default:
        throw `Unknown Type '${this.type}' cannot set variable '${this.getExpression()}'`;
    }
    return new TSExpressionResult('');
  }

  private evaluateSet(currentValue: string | number | undefined, value: TSExpressionResult) {
    const num = Number.parseFloat(value.asString());
    this.assign(Number.isNaN(num) ? value.asString() : num);
  }

  private evaluatePlus(currentValue: string | number | undefined, value: TSExpressionResult) {
    this.assign(Number.parseFloat(`${currentValue}`) + value.asNumber());
  }

  private evaluateMinus(currentValue: string | number | undefined, value: TSExpressionResult) {
    this.assign(Number.parseFloat(`${currentValue}`) - value.asNumber());
  }

  private evaluateMult(currentValue: string | number | undefined, value: TSExpressionResult) {
    this.assign(Number.parseFloat(`${currentValue}`) * value.asNumber());
  }

  private evaluateDiv(currentValue: string | number | undefined, value: TSExpressionResult) {
    this.assign(Number.parseFloat(`${currentValue}`) / value.asNumber());
  }

  private evaluateDivRound(currentValue: string | number | undefined, value: TSExpressionResult) {
    this.assign(Math.round(Number.parseFloat(`${currentValue}`) / value.asNumber()));
  }

  private evaluateMinimumBoundary(currentValue: string | number | undefined, value: TSExpressionResult) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = Number.parseFloat(value.asString());
    if (Number.isNaN(currentInt) || currentInt < newInt) this.assign(newInt);
  }

  private evaluateMaximumBoundary(currentValue: string | number | undefined, value: TSExpressionResult) {
    const currentInt = Number.parseFloat(`${currentValue}`);
    const newInt = value.asNumber();
    if (Number.isNaN(currentInt) || currentInt > newInt) this.assign(newInt);
  }

  private evaluateAppendText(currentValue: string | number | undefined, value: TSExpressionResult) {
    const valueString = value.asString();
    const result = currentValue ? `${currentValue}${valueString}` : `${valueString}`;
    this.assign(result);
  }

  private assign(value: string | number) {
    evalcontext.assignVar(this.call.tablename, this.call.variablename, value);
  }

  getExpression(): string {
    return `|${this.varNameExpression.getExpression()}${this.type}${this.valueExpression.getExpression()}|`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSVariableSetExpression;
