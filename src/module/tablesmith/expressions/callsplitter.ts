import { evalcontext } from './evaluationcontextinstance';

enum TYPE {
  variable = '!',
  group = '.',
}

export default class CallSplitter {
  type: TYPE;
  private constructor(type: TYPE) {
    this.type = type;
  }
  static forVariable(): CallSplitter {
    return new CallSplitter(TYPE.variable);
  }
  static forGroup(): CallSplitter {
    return new CallSplitter(TYPE.group);
  }

  split(input: string): { tablename: string; variablename: string } {
    const tableGroup = input.trim().split(this.type);
    const result = { tablename: '', variablename: '' };
    switch (tableGroup.length) {
      case 1:
        result.tablename = evalcontext.getCurrentCallTablename();
        result.variablename = tableGroup[0];
        break;
      case 2:
        result.tablename = tableGroup[0];
        result.variablename = tableGroup[1];
        break;
      default:
        throw `Could not get variable expression did not result in ([tablename].)?[varname] but '${input}'`;
    }
    return result;
  }
}
