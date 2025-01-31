import { evalcontext } from '../../src/module/tablesmith/expressions/evaluationcontextinstance';
import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing variables', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('variable declaration without initial value creates empty variable', () => {
    simpleTable = '%varname%,\n:Start\n1,%varname%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(evalcontext.getVar(filename, 'varname')).toBeNull();
  });

  it('variable declaration with initial value creates variable with value set', () => {
    simpleTable = '%varname%,value\n:Start\n1,%varname%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(evalcontext.getVar(filename, 'varname')).toBe('value');
  });

  it('declared variable can be referenced with table and name from Group', () => {
    simpleTable = `%varname%,value\n:Start\n1,%${filename}!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value');
  });

  it('declared variable can be referenced from other table', () => {
    tablesmith.addTable('folder', 'other', '%varname%,othervalue\n:Start\n1,other');
    simpleTable = `%varname%,value\n:Start\n1,%other!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('othervalue');
  });

  it('declared variable can be set from other table', () => {
    tablesmith.addTable('folder', 'other', '%varname%,othervalue\n:Start\n1,other');
    simpleTable = `%varname%,value\n:Start\n1,|other!varname=%varname%|%other!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value');
  });

  it('declared variable can be referenced from Group', () => {
    simpleTable = `%varname%,value\n:Start\n1,%varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value');
  });
  it('declared variable can be chained', () => {
    simpleTable = `%varname%,value\n:Start\n1,%varname%%varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('valuevalue');
  });

  it('declared variable can be referenced from {Dice~', () => {
    simpleTable = '%varname%,10\n:Start\n1,{Dice~1d1-%varname%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-9');
  });

  it('declared variable can be referenced from {Calc~', () => {
    simpleTable = '%varname%,10\n:Start\n1,{Calc~1-%varname%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-9');
  });

  it('setting variables |varname=10|', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname=10|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(10);
  });

  it('setting variables with Function |varname={Dice~10d1}|', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname={Dice~10d1}|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(10);
  });

  it('setting variables with reference to same var |varname={Calc~%varname%+%varname%}|', () => {
    simpleTable = '%varname%,99\n:Start\n1,|varname={Calc~%varname%+%varname%}|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(198);
  });

  it('setting variables |varname+10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname+10|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(20);
  });

  it('setting variables |varname-10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname-10|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(0);
  });

  it('setting variables |varname*10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname*10|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(100);
  });

  it('setting variables |varname/10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/10|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(1);
  });

  it('setting variables |varname/3| decimal value', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBeCloseTo(3.33);
  });

  it('setting variables |varname\\3| var=10 rounding down', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname\\3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname\\3| var=11 rounding down', () => {
    simpleTable = '%varname%,11\n:Start\n1,|varname\\3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(4);
  });

  it('setting variables |varname<3| var=1 changed', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname<3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var unset changed', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname<3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var=4 unchanged', () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname<3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe('4');
  });

  it('setting variables |varname>3| var=4 changed', () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname>3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var unset changed', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname>3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var=1 unchanged', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname>3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe('1');
  });

  it('setting variables |varname&3| var=1', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname&3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe('13');
  });
  it('setting variables |varname&3| var unset', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname&3|\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(evalcontext.getVar(filename, 'varname')).toBe('3');
  });
});
