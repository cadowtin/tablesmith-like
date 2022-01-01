import TSGroup from '../tsgroup';
import TSRange from '../tsrange';
import TSExpression from '../expressions/tsexpression';
import ParserStack from './parserstack';
import TSIfExpression from '../expressions/tsifexpression';
import TSExpressions from '../expressions/tsexpressions';
import TSBooleanExpression from '../expressions/tsbooleanexpression';
import BooleanComparison from '../expressions/booleancomparison';

/**
 * Group Builder is the main helper for Tablesmith parsing to hold togehter the context of a single TSGroup
 * that belongs to a table. The helper holds all needed state and stacks of contexts for parsing purpose.
 */
class TSTableGroupBuilder {
  tsGroup: TSGroup;
  range: TSRange | undefined;
  stack: ParserStack;
  constructor(group: TSGroup, stack: ParserStack) {
    this.tsGroup = group;
    this.stack = stack;
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    const lower = this.tsGroup.lastRange() ? this.tsGroup.lastRange().upper + 1 : 1;
    this.range = new TSRange(lower, upper);
    this.stack.current = this.range.getExpressions();
    this.tsGroup.addRange(this.range);
  }

  /**
   * Adds expression to currently setup expressions, that can be a Range or a before or after part.
   * @param expression to add to this group.
   */
  addExpression(expression: TSExpression): void {
    expression.setGroup(this.tsGroup);
    this.stack.addExpression(expression);
  }

  /**
   * Helper setting up the current expressions to add to the before expressions of the group.
   */
  addBefore(): void {
    this.stack.current = this.tsGroup.before;
  }

  /**
   * Helper setting up the current expressions to add to the after expressions of the group.
   */
  addAfter(): void {
    this.stack.current = this.tsGroup.after;
  }

  /**
   * Toggles variable assignment Context on and off. If toggled on the Expressions are collected
   * for the variable assignment and the current expressions stacked away. If toggled of the old expression stack
   * is restored to save Expressions following variable assignment.
   */
  toggleVariableAssigment(): void {
    this.stack.toggleVariableAssigment();
  }

  /**
   * Starts boolean expression with given type.
   * @param type can be "And" or "Or".
   */
  startBooleanExpression(type: string) {
    this.stack.stackBoolean(type);
  }

  /**
   * Starts the next boolean expression part for Boolean functions.
   */
  startNextBooleanExpression(): void {
    this.stack.stack();
  }

  /**
   * Starts an If expression.
   * @param functionname of the If can be "If" or "IIf".
   */
  startIf(functionname: string) {
    this.stack.stackIf(functionname);
  }

  /**
   * Sets the operator used in boolean comparison.
   * @param operator to set for comparison.
   */
  setBooleanComparisonOperator(operator: string) {
    this.stack.stackBooleanOperator(operator);
  }

  /**
   * Starts the true value Expressions for the if.
   */
  startIfTrueValue(): void {
    this.stack.stack();
  }

  /**
   * Starts the true value Expressions for the if.
   */
  startIfFalseValue(): void {
    this.stack.stackIfFalseValue();
  }

  /**
   * Creates if Expression from last stacked values and returns it.
   * @returns TSIfExpression If Expression on top of stack.
   */
  createIf(): TSIfExpression {
    let falseVal, trueVal;
    if (this.stack.unstackIfFalseValueAdded()) {
      falseVal = this.stack.getCurrentExpressions();
      trueVal = this.stack.unstack();
    } else {
      falseVal = new TSExpressions();
      trueVal = this.stack.getCurrentExpressions();
    }
    const ifExpression2 = this.stack.unstack();
    const ifExpression1 = this.stack.unstack();
    const operator = this.stack.unstackBooleanOperator();
    const functionName = this.stack.unstackIf();
    this.stack.unstack(); // pop out the last if, to be back to previous context
    const booleanComparision = new BooleanComparison(ifExpression1, operator, ifExpression2);
    return new TSIfExpression(functionName, booleanComparision, trueVal, falseVal);
  }

  /**
   * Creates Boolean Expression "Or" or "And" from last stacked values and returns it.
   * @returns TSIfExpression If Expression on top of stack.
   */
  createBooleanExpression(): TSBooleanExpression {
    let ifExpression2 = this.stack.getCurrentExpressions();
    let ifExpression1 = this.stack.unstack();
    let operator = this.stack.unstackBooleanOperator();
    const booleanComparison2 = new BooleanComparison(ifExpression1, operator, ifExpression2);
    ifExpression2 = this.stack.unstack();
    ifExpression1 = this.stack.unstack();
    operator = this.stack.unstackBooleanOperator();
    const booleanComparison1 = new BooleanComparison(ifExpression1, operator, ifExpression2);
    const functionName = this.stack.unstackBoolean();
    this.stack.unstack(); // pop out the last if, to be back to previous context
    return new TSBooleanExpression(functionName, booleanComparison1, booleanComparison2);
  }
}

export default TSTableGroupBuilder;
