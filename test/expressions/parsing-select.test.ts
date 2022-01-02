import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {Select~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('select expressions correct with simple tuples', () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Select~%var%,key1,value1,key2,value2,default}',
    );
  });

  it('loop expressions correct with complex expressions', () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,[key1],{Calc~1*2},%key2%,value2,default}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Select~%var%,[key1],{Calc~1*2},%key2%,value2,default}',
    );
  });

  it('retrieve first key', () => {
    simpleTable = '%var%,key1\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value1');
  });

  it('retrieve second key', () => {
    simpleTable = '%var%,key2\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value2');
  });

  it('get default for no match', () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('default');
  });
});