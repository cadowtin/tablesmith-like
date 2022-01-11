import TSTable from './tstable';
import TSParserFactory from './parser/tsparserfactory';
import { evalcontext } from './expressions/evaluationcontextinstance';
import GroupCallModifierTerm from './expressions/terms/groupcallmodifierterm';
import TSGroup from './tsgroup';
import { tstables } from './tstables';
import { tableparser } from './parser/tableparser';
import { callparser } from './parser/callparser';

/**
 * The Tablesmith class to setup the Tablesmith environment, contains all parsed tables and provides needed functionality
 * to retrive results.
 */
class Tablesmith {
  evaluateTable: TSTable | undefined;

  /**
   * Resets to instance without parsed tables, normally only needed for testing purpose.
   */
  reset(): void {
    tstables.reset();
  }

  /**
   * Roll on a Table and Group and returns evaluated string. Roll can be preset with optional modifier '=' or
   * roll can be modified by a value using '+' or '-' to add modifier to the roll.
   * @param expression Expression to get evaluated Text Result for, form is [Table.Group] or [Group] with potential
   * added modifier in the form "=int", "+int" or "-int".
   * @returns result from Table as text.
   */
  evaluate(expression: string): string {
    const options = { table: '', group: '', modType: 'unmodified', modNumber: 0 };
    const group = this.parseEvaluateExpression(expression, options);
    if (!group)
      throw `TSTable for name='${options.table}' does not contain Group='${options.group}'! Expression was '${expression}'`;
    const modifier = GroupCallModifierTerm.create(options.modType, options.modNumber);
    this.resetEvaluationContext();
    const result = group.roll(modifier);
    evalcontext.popCurrentCallTablename();
    return result;
  }

  /**
   * Parses an evaluate expressions for Tablesmith.
   * @param expression to parse.
   * @param options given to the parser, where results are added to.
   * @returns TSGroup to evaluate or undefined, if it does not exists.
   */
  private parseEvaluateExpression(
    expression: string,
    options: { table: string; group: string; modType: string; modNumber: number },
  ): TSGroup | undefined {
    callparser.parse(expression, options);
    const evaluateTable = this.tableForName(options.table);
    if (!evaluateTable) throw `TSTable for name='${options.table}' not defined! Expression was '${expression}'`;
    evalcontext.pushCurrentCallTablename(options.table);
    _setDefaultGroup(options);
    const group = evaluateTable.groupForName(options.group);
    return group;
  }

  /**
   * Resets the EvaluationContext for all tables.
   */
  resetEvaluationContext() {
    tstables.resetEvaluationContext();
  }
  /**
   * Parses table and stores it with given filename as Tablename.
   * @param filename name of file, used as Table name for evaluation.
   * @param fileContent file as a single string to be parsed.
   */
  addTable(filename: string, fileContent: string): TSTable {
    const tstable = new TSTable(_stripPathAndExtensions(filename));
    tableparser.parse(fileContent, this._parseOptions(tstable));
    tstables.addTable(tstable);
    return tstable;
  }

  _parseOptions(table: TSTable): {
    pf: TSParserFactory; // pf= ParserFactory
  } {
    return {
      pf: new TSParserFactory(table),
    };
  }

  /**
   * Searches all tables for table with given name and returns it.
   * @param name of table to retrieve.
   * @returns Table for name or undefined if no table was found.
   */
  tableForName(name: string): TSTable | undefined {
    return tstables.tableForName(name);
  }
}

/**
 * Tests if Group to call in options is set or sets it to default Group for any Table "Start".
 * @param options definining a Table call, with Group to set to default if undefined.
 */
function _setDefaultGroup(options: { group: string }): void {
  if (!options.group || options.group.length == 0) options.group = 'Start';
}

export default Tablesmith;
function _stripPathAndExtensions(filename: string): string {
  return filename.trim().replace('.tab', '');
}