import {
  parse,
  type CallExpression,
  type Expression,
  type MemberExpression,
  type ModuleDeclaration,
  type Node,
  type Pattern,
  type Program,
  type Statement,
  type VariableDeclaration,
} from 'acorn';

export type VisualValue = number | string | boolean | null | VisualValue[];

export interface TraceFrame {
  line: number;
  description: string;
  source: string;
  variables: Record<string, VisualValue>;
  output: string[];
}

export interface VisualizationResult {
  frames: TraceFrame[];
  metrics: {
    characters: number;
    lines: number;
    astNodes: number;
    operations: number;
    loopIterations: number;
    peakCells: number;
  };
}

export const CODE_LIMITS = {
  sourceCharacters: 4_000,
  sourceLines: 120,
  astNodes: 800,
  operations: 8_000,
  loopIterations: 1_000,
  traceFrames: 500,
  variables: 40,
  collectionItems: 160,
  totalCells: 600,
  stringCharacters: 500,
  outputLines: 30,
  runtimeMs: 150,
} as const;

export type GuardrailCode = 'syntax' | 'source' | 'complexity' | 'memory' | 'unsupported';

export class CodeGuardrailError extends Error {
  readonly code: GuardrailCode;

  constructor(code: GuardrailCode, message: string) {
    super(message);
    this.name = 'CodeGuardrailError';
    this.code = code;
  }
}

type Signal = 'normal' | 'break' | 'continue';
type ExecutableStatement = Statement | ModuleDeclaration;

interface Runtime {
  source: string;
  environment: Map<string, VisualValue>;
  frames: TraceFrame[];
  output: string[];
  operations: number;
  loopIterations: number;
  peakCells: number;
  startedAt: number;
}

function fail(code: GuardrailCode, message: string): never {
  throw new CodeGuardrailError(code, message);
}

function lineNumber(node: Node): number {
  return node.loc?.start.line ?? 1;
}

function unsupported(node: Node, detail?: string): never {
  return fail('unsupported', `${detail ?? node.type} is not supported on line ${lineNumber(node)}.`);
}

function cloneValue(value: VisualValue): VisualValue {
  return Array.isArray(value) ? value.map(cloneValue) : value;
}

function valueCells(value: VisualValue, depth = 0): number {
  if (depth > 3) fail('memory', 'Nested collections are limited to three levels.');
  if (!Array.isArray(value)) {
    if (typeof value === 'string' && value.length > CODE_LIMITS.stringCharacters) {
      fail('memory', `Strings are limited to ${CODE_LIMITS.stringCharacters} characters.`);
    }
    if (typeof value === 'number' && !Number.isFinite(value)) fail('complexity', 'Calculations must produce finite numbers.');
    return 1;
  }
  if (value.length > CODE_LIMITS.collectionItems) {
    fail('memory', `Collections are limited to ${CODE_LIMITS.collectionItems} items.`);
  }
  let cells = 1;
  for (const item of value) cells += valueCells(item, depth + 1);
  return cells;
}

function checkBudget(runtime: Runtime): void {
  runtime.operations += 1;
  if (runtime.operations > CODE_LIMITS.operations) {
    fail('complexity', `Execution exceeded ${CODE_LIMITS.operations.toLocaleString()} operations.`);
  }
  if (performance.now() - runtime.startedAt > CODE_LIMITS.runtimeMs) {
    fail('complexity', `Execution exceeded the ${CODE_LIMITS.runtimeMs}ms time budget.`);
  }
}

function checkMemory(runtime: Runtime): void {
  let cells = 0;
  for (const value of runtime.environment.values()) cells += valueCells(value);
  runtime.peakCells = Math.max(runtime.peakCells, cells);
  if (cells > CODE_LIMITS.totalCells) {
    fail('memory', `Live state exceeded the ${CODE_LIMITS.totalCells}-cell memory budget.`);
  }
}

function snapshot(runtime: Runtime): Record<string, VisualValue> {
  return Object.fromEntries(
    [...runtime.environment.entries()].map(([name, value]) => [name, cloneValue(value)]),
  );
}

function capture(runtime: Runtime, node: Node, description: string): void {
  if (runtime.frames.length >= CODE_LIMITS.traceFrames) {
    fail('complexity', `Visualization exceeded ${CODE_LIMITS.traceFrames} trace steps.`);
  }
  checkMemory(runtime);
  runtime.frames.push({
    line: lineNumber(node),
    description,
    source: runtime.source.slice(node.start, node.end).split('\n')[0]?.trim() ?? '',
    variables: snapshot(runtime),
    output: [...runtime.output],
  });
}

function setVariable(runtime: Runtime, name: string, value: VisualValue): VisualValue {
  valueCells(value);
  if (!runtime.environment.has(name) && runtime.environment.size >= CODE_LIMITS.variables) {
    fail('memory', `Programs may use at most ${CODE_LIMITS.variables} variables.`);
  }
  runtime.environment.set(name, value);
  return value;
}

function readVariable(runtime: Runtime, name: string, node: Node): VisualValue {
  if (!runtime.environment.has(name)) fail('syntax', `Unknown variable “${name}” on line ${lineNumber(node)}.`);
  return runtime.environment.get(name) ?? null;
}

function asNumber(value: VisualValue, node: Node): number {
  if (typeof value !== 'number') unsupported(node, 'This operation requires numbers');
  return value;
}

function asIndex(value: VisualValue, node: Node): number {
  const index = asNumber(value, node);
  if (!Number.isInteger(index) || index < 0) fail('syntax', `Array indexes must be non-negative integers on line ${lineNumber(node)}.`);
  return index;
}

function asBoolean(value: VisualValue): boolean {
  return Array.isArray(value) ? true : Boolean(value);
}

function valuesEqual(left: VisualValue, right: VisualValue): boolean {
  return left === right;
}

function formatValue(value: VisualValue): string {
  if (Array.isArray(value)) return `[${value.map(formatValue).join(', ')}]`;
  return String(value);
}

function applyBinary(operator: string, left: VisualValue, right: VisualValue, node: Node): VisualValue {
  switch (operator) {
    case '+':
      if (typeof left === 'string' || typeof right === 'string') return `${formatValue(left)}${formatValue(right)}`;
      return asNumber(left, node) + asNumber(right, node);
    case '-':
      return asNumber(left, node) - asNumber(right, node);
    case '*':
      return asNumber(left, node) * asNumber(right, node);
    case '/':
      return asNumber(left, node) / asNumber(right, node);
    case '%':
      return asNumber(left, node) % asNumber(right, node);
    case '**':
      return asNumber(left, node) ** asNumber(right, node);
    case '<':
      return asNumber(left, node) < asNumber(right, node);
    case '<=':
      return asNumber(left, node) <= asNumber(right, node);
    case '>':
      return asNumber(left, node) > asNumber(right, node);
    case '>=':
      return asNumber(left, node) >= asNumber(right, node);
    case '==':
    case '===':
      return valuesEqual(left, right);
    case '!=':
    case '!==':
      return !valuesEqual(left, right);
    default:
      return unsupported(node, `Operator ${operator}`);
  }
}

function memberName(member: MemberExpression): string | null {
  return !member.computed && member.property.type === 'Identifier' ? member.property.name : null;
}

function readMember(member: MemberExpression, runtime: Runtime): VisualValue {
  if (member.object.type === 'Super') unsupported(member, 'Super');
  const target = evaluateExpression(member.object, runtime);
  if (member.computed) {
    if (member.property.type === 'PrivateIdentifier') unsupported(member.property, 'Private properties');
    if (!Array.isArray(target)) unsupported(member, 'Only arrays can be indexed');
    const index = asIndex(evaluateExpression(member.property, runtime), member);
    if (index >= target.length) fail('syntax', `Index ${index} is outside the array on line ${lineNumber(member)}.`);
    return target[index] ?? null;
  }
  const name = memberName(member);
  if (name !== 'length') unsupported(member, `Property .${name ?? '?'}`);
  if (!Array.isArray(target) && typeof target !== 'string') unsupported(member, 'Only arrays and strings have a readable length');
  return target.length;
}

function assign(target: Pattern | Expression, value: VisualValue, runtime: Runtime): VisualValue {
  valueCells(value);
  if (target.type === 'Identifier') return setVariable(runtime, target.name, value);
  if (target.type === 'MemberExpression') {
    if (target.object.type === 'Super') unsupported(target, 'Super');
    if (!target.computed || target.property.type === 'PrivateIdentifier') unsupported(target, 'Only array elements can be assigned');
    const collection = evaluateExpression(target.object, runtime);
    if (!Array.isArray(collection)) unsupported(target, 'Only array elements can be assigned');
    const index = asIndex(evaluateExpression(target.property, runtime), target);
    if (index >= collection.length) fail('memory', 'Sparse arrays and implicit array growth are not supported.');
    collection[index] = value;
    valueCells(collection);
    return value;
  }
  return unsupported(target, 'Assignment target');
}

function update(target: Expression, delta: number, runtime: Runtime): number {
  const current = target.type === 'Identifier'
    ? readVariable(runtime, target.name, target)
    : target.type === 'MemberExpression'
      ? readMember(target, runtime)
      : unsupported(target, 'Increment target');
  const next = asNumber(current, target) + delta;
  assign(target, next, runtime);
  return next;
}

function evaluateCall(call: CallExpression, runtime: Runtime): VisualValue {
  if (call.callee.type !== 'MemberExpression') unsupported(call, 'Function calls');
  const callee = call.callee;
  if (callee.object.type === 'Super') unsupported(call, 'Function calls');
  const object = callee.object;
  const name = memberName(callee);
  if (!name) unsupported(call, 'Computed method calls');
  if (call.arguments.some((argument) => argument.type === 'SpreadElement')) unsupported(call, 'Spread arguments');
  const args = call.arguments as Expression[];

  if (object.type === 'Identifier' && object.name === 'console' && name === 'log') {
    const text = args.map((argument) => formatValue(evaluateExpression(argument, runtime))).join(' ');
    if (text.length > CODE_LIMITS.stringCharacters) fail('memory', 'Console output line is too long.');
    if (runtime.output.length >= CODE_LIMITS.outputLines) fail('memory', `Console output is limited to ${CODE_LIMITS.outputLines} lines.`);
    runtime.output.push(text);
    return null;
  }

  if (object.type === 'Identifier' && object.name === 'Math') {
    const functions: Record<string, (...values: number[]) => number> = {
      abs: Math.abs,
      ceil: Math.ceil,
      floor: Math.floor,
      max: Math.max,
      min: Math.min,
      round: Math.round,
      sqrt: Math.sqrt,
    };
    const fn = functions[name];
    if (!fn) unsupported(call, `Math.${name}`);
    return fn(...args.map((argument) => asNumber(evaluateExpression(argument, runtime), argument)));
  }

  const collection = evaluateExpression(object, runtime);
  if (!Array.isArray(collection)) unsupported(call, 'Method calls');
  const values = args.map((argument) => evaluateExpression(argument, runtime));
  switch (name) {
    case 'push':
      if (collection.length + values.length > CODE_LIMITS.collectionItems) fail('memory', `Collections are limited to ${CODE_LIMITS.collectionItems} items.`);
      collection.push(...values);
      return collection.length;
    case 'pop':
      return collection.pop() ?? null;
    case 'shift':
      return collection.shift() ?? null;
    case 'unshift':
      if (collection.length + values.length > CODE_LIMITS.collectionItems) fail('memory', `Collections are limited to ${CODE_LIMITS.collectionItems} items.`);
      collection.unshift(...values);
      return collection.length;
    case 'includes':
      return values.length === 1 && collection.some((value) => valuesEqual(value, values[0] ?? null));
    case 'indexOf':
      return values.length === 1 ? collection.findIndex((value) => valuesEqual(value, values[0] ?? null)) : -1;
    default:
      return unsupported(call, `Array.${name}`);
  }
}

function evaluateExpression(expression: Expression, runtime: Runtime): VisualValue {
  checkBudget(runtime);
  switch (expression.type) {
    case 'Literal':
      if (typeof expression.value === 'bigint' || expression.value instanceof RegExp || expression.value === undefined) {
        return unsupported(expression, 'This literal');
      }
      return expression.value;
    case 'Identifier':
      return readVariable(runtime, expression.name, expression);
    case 'ArrayExpression': {
      const value = expression.elements.map((element) => {
        if (!element) return null;
        if (element.type === 'SpreadElement') return unsupported(element, 'Array spread');
        return evaluateExpression(element, runtime);
      });
      valueCells(value);
      return value;
    }
    case 'MemberExpression':
      return readMember(expression, runtime);
    case 'ConditionalExpression':
      return asBoolean(evaluateExpression(expression.test, runtime))
        ? evaluateExpression(expression.consequent, runtime)
        : evaluateExpression(expression.alternate, runtime);
    case 'UnaryExpression':
      if (expression.operator === '!') return !asBoolean(evaluateExpression(expression.argument, runtime));
      if (expression.operator === '-') return -asNumber(evaluateExpression(expression.argument, runtime), expression);
      if (expression.operator === '+') return asNumber(evaluateExpression(expression.argument, runtime), expression);
      return unsupported(expression, `Unary operator ${expression.operator}`);
    case 'UpdateExpression': {
      const current = expression.argument.type === 'Identifier'
        ? readVariable(runtime, expression.argument.name, expression.argument)
        : expression.argument.type === 'MemberExpression'
          ? readMember(expression.argument, runtime)
          : unsupported(expression, 'Increment target');
      const next = update(expression.argument, expression.operator === '++' ? 1 : -1, runtime);
      return expression.prefix ? next : current;
    }
    case 'LogicalExpression': {
      const left = evaluateExpression(expression.left, runtime);
      if (expression.operator === '&&') return asBoolean(left) ? evaluateExpression(expression.right, runtime) : left;
      if (expression.operator === '||') return asBoolean(left) ? left : evaluateExpression(expression.right, runtime);
      return left ?? evaluateExpression(expression.right, runtime);
    }
    case 'AssignmentExpression': {
      const right = evaluateExpression(expression.right, runtime);
      if (expression.operator === '=') return assign(expression.left, right, runtime);
      const operator = expression.operator.slice(0, -1);
      const left = expression.left.type === 'Identifier'
        ? readVariable(runtime, expression.left.name, expression.left)
        : expression.left.type === 'MemberExpression'
          ? readMember(expression.left, runtime)
          : unsupported(expression.left, 'Assignment target');
      return assign(expression.left, applyBinary(operator, left, right, expression), runtime);
    }
    case 'BinaryExpression':
      if (expression.left.type === 'PrivateIdentifier') unsupported(expression.left, 'Private identifiers');
      return applyBinary(
        expression.operator,
        evaluateExpression(expression.left, runtime),
        evaluateExpression(expression.right, runtime),
        expression,
      );
    case 'CallExpression':
      return evaluateCall(expression, runtime);
    case 'ParenthesizedExpression':
      return evaluateExpression(expression.expression, runtime);
    default:
      return unsupported(expression);
  }
}

function declareVariables(declaration: VariableDeclaration, runtime: Runtime): void {
  for (const item of declaration.declarations) {
    if (item.id.type !== 'Identifier') unsupported(item, 'Destructuring');
    setVariable(runtime, item.id.name, item.init ? evaluateExpression(item.init, runtime) : null);
  }
}

function runStatements(statements: ExecutableStatement[], runtime: Runtime): Signal {
  for (const statement of statements) {
    const signal = runStatement(statement, runtime);
    if (signal !== 'normal') return signal;
  }
  return 'normal';
}

function bumpLoop(runtime: Runtime, node: Node): void {
  runtime.loopIterations += 1;
  if (runtime.loopIterations > CODE_LIMITS.loopIterations) {
    fail('complexity', `Loops exceeded ${CODE_LIMITS.loopIterations.toLocaleString()} iterations near line ${lineNumber(node)}.`);
  }
  checkBudget(runtime);
}

function runStatement(statement: ExecutableStatement, runtime: Runtime): Signal {
  checkBudget(runtime);
  switch (statement.type) {
    case 'BlockStatement':
      return runStatements(statement.body, runtime);
    case 'VariableDeclaration':
      declareVariables(statement, runtime);
      capture(runtime, statement, 'Declared variables');
      return 'normal';
    case 'ExpressionStatement':
      evaluateExpression(statement.expression, runtime);
      capture(runtime, statement, 'Updated state');
      return 'normal';
    case 'IfStatement': {
      const matched = asBoolean(evaluateExpression(statement.test, runtime));
      capture(runtime, statement, matched ? 'Condition matched' : 'Condition skipped');
      return matched
        ? runStatement(statement.consequent, runtime)
        : statement.alternate
          ? runStatement(statement.alternate, runtime)
          : 'normal';
    }
    case 'ForStatement': {
      if (statement.init) {
        if (statement.init.type === 'VariableDeclaration') declareVariables(statement.init, runtime);
        else evaluateExpression(statement.init, runtime);
      }
      let iterations = 0;
      while (!statement.test || asBoolean(evaluateExpression(statement.test, runtime))) {
        bumpLoop(runtime, statement);
        iterations += 1;
        capture(runtime, statement, `For loop · iteration ${iterations}`);
        const signal = runStatement(statement.body, runtime);
        if (signal === 'break') break;
        if (statement.update) evaluateExpression(statement.update, runtime);
      }
      capture(runtime, statement, `For loop complete · ${iterations} iterations`);
      return 'normal';
    }
    case 'WhileStatement': {
      let iterations = 0;
      while (asBoolean(evaluateExpression(statement.test, runtime))) {
        bumpLoop(runtime, statement);
        iterations += 1;
        capture(runtime, statement, `While loop · iteration ${iterations}`);
        const signal = runStatement(statement.body, runtime);
        if (signal === 'break') break;
      }
      capture(runtime, statement, `While loop complete · ${iterations} iterations`);
      return 'normal';
    }
    case 'ForOfStatement': {
      if (statement.left.type !== 'VariableDeclaration' || statement.left.declarations.length !== 1) {
        unsupported(statement, 'For-of initializer');
      }
      const declaration = statement.left.declarations[0];
      if (!declaration || declaration.id.type !== 'Identifier') unsupported(statement, 'For-of destructuring');
      const collection = evaluateExpression(statement.right, runtime);
      if (!Array.isArray(collection)) unsupported(statement.right, 'For-of requires an array');
      for (let index = 0; index < collection.length; index += 1) {
        bumpLoop(runtime, statement);
        setVariable(runtime, declaration.id.name, collection[index] ?? null);
        capture(runtime, statement, `For-of loop · item ${index + 1} of ${collection.length}`);
        const signal = runStatement(statement.body, runtime);
        if (signal === 'break') break;
      }
      return 'normal';
    }
    case 'BreakStatement':
      return 'break';
    case 'ContinueStatement':
      return 'continue';
    case 'EmptyStatement':
      return 'normal';
    default:
      return unsupported(statement);
  }
}

function isNode(value: unknown): value is Node {
  return typeof value === 'object' && value !== null && 'type' in value && typeof (value as { type?: unknown }).type === 'string';
}

function countNodes(root: Node): number {
  let count = 0;
  const visit = (node: Node): void => {
    count += 1;
    if (count > CODE_LIMITS.astNodes) fail('complexity', `Code is limited to ${CODE_LIMITS.astNodes} syntax nodes.`);
    for (const value of Object.values(node)) {
      if (Array.isArray(value)) {
        for (const item of value) if (isNode(item)) visit(item);
      } else if (isNode(value)) {
        visit(value);
      }
    }
  };
  visit(root);
  return count;
}

function parseSource(source: string): { program: Program; astNodes: number } {
  if (!source.trim()) fail('source', 'Enter a small JavaScript algorithm to visualize.');
  if (source.length > CODE_LIMITS.sourceCharacters) fail('source', `Code is limited to ${CODE_LIMITS.sourceCharacters.toLocaleString()} characters.`);
  if (source.split(/\r?\n/).length > CODE_LIMITS.sourceLines) fail('source', `Code is limited to ${CODE_LIMITS.sourceLines} lines.`);
  try {
    const program = parse(source, { ecmaVersion: 2022, sourceType: 'script', locations: true });
    return { program, astNodes: countNodes(program) };
  } catch (caught) {
    return fail('syntax', caught instanceof Error ? caught.message : 'The code could not be parsed.');
  }
}

/**
 * Interprets a deliberately small JavaScript subset and records state changes.
 * User code is never passed to eval, Function, a worker, or the browser runtime.
 */
export function visualizeCode(source: string): VisualizationResult {
  const { program, astNodes } = parseSource(source);
  const runtime: Runtime = {
    source,
    environment: new Map(),
    frames: [],
    output: [],
    operations: 0,
    loopIterations: 0,
    peakCells: 0,
    startedAt: performance.now(),
  };
  const signal = runStatements(program.body, runtime);
  if (signal !== 'normal') fail('syntax', `${signal} can only be used inside a loop.`);
  if (runtime.frames.length === 0) fail('source', 'Add at least one variable, condition, loop, or expression.');
  return {
    frames: runtime.frames,
    metrics: {
      characters: source.length,
      lines: source.split(/\r?\n/).length,
      astNodes,
      operations: runtime.operations,
      loopIterations: runtime.loopIterations,
      peakCells: runtime.peakCells,
    },
  };
}
