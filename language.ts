type TokenType =
  | "EQEQ"
  | "EQUAL"
  | "GT"
  | "LT"
  | "PLUS"
  | "MINUS"
  | "NUMBER"
  | "STRING"
  | "WHEN"
  | "OTHERWISE"
  | "ECHO"
  | "DECLARE"
  | "REPEAT"
  | "THROUGH"
  | "LBRACKET"
  | "RBRACKET"
  | "COMMA"
  | "IDENT"
  | "SKIP"
  | "EOF";

interface Token {
  type: TokenType;
  value: string;
}

const TOKEN_SPEC: [TokenType, RegExp][] = [
  ["EQEQ", /==/],
  ["EQUAL", /=/],
  ["GT", />/],
  ["LT", /</],
  ["PLUS", /\+/],
  ["MINUS", /-/],
  ["NUMBER", /\d+/],
  ["STRING", /"[^"]*"/],
  ["WHEN", /when/],
  ["OTHERWISE", /otherwise/],
  ["ECHO", /echo/],
  ["DECLARE", /declare/],
  ["REPEAT", /repeat/],
  ["THROUGH", /through/],
  ["LBRACKET", /\[/],
  ["RBRACKET", /\]/],
  ["COMMA", /,/],
  ["IDENT", /[a-zA-Z_]\w*/],
  ["SKIP", /[ \t\r\n]+/],
];

const tokenRegex = new RegExp(
  TOKEN_SPEC.map(([type, regex]) => `(?<${type}>${regex.source})`).join("|"),
  "g"
);

function lexer(code: string): Token[] {
  const tokens: Token[] = [];
  tokenRegex.lastIndex = 0;
  for (const match of code.matchAll(tokenRegex)) {
    const type = Object.keys(match.groups!).find(
      (k) => match.groups![k] !== undefined
    ) as TokenType;
    if (type === "SKIP") continue;
    tokens.push({ type, value: match[0] });
  }
  tokens.push({ type: "EOF", value: "" });
  return tokens;
}

abstract class ASTNode {}
class Num extends ASTNode {
  constructor(public value: number) {
    super();
  }
}
class Str extends ASTNode {
  constructor(public value: string) {
    super();
  }
}
class Var extends ASTNode {
  constructor(public name: string) {
    super();
  }
}
class BinOp extends ASTNode {
  constructor(public left: ASTNode, public op: string, public right: ASTNode) {
    super();
  }
}
class Declare extends ASTNode {
  constructor(public target: string, public expr: ASTNode) {
    super();
  }
}
class Echo extends ASTNode {
  constructor(public expr: ASTNode) {
    super();
  }
}
class When extends ASTNode {
  constructor(
    public condition: ASTNode,
    public thenStmt: ASTNode | null,
    public elseStmt: ASTNode | null = null
  ) {
    super();
  }
}
class ArrayLit extends ASTNode {
  constructor(public elements: ASTNode[]) {
    super();
  }
}
class Repeat extends ASTNode {
  constructor(
    public variable: string,
    public iterable: ASTNode,
    public body: ASTNode | null
  ) {
    super();
  }
}

class Parser {
  private pos = 0;
  constructor(private tokens: Token[]) {}

  private peek() {
    return this.tokens[this.pos] ?? { type: "EOF" as const, value: "" };
  }
  private next() {
    return this.tokens[this.pos++] ?? { type: "EOF" as const, value: "" };
  }

  private expect(type: TokenType, value?: string) {
    const tok = this.peek();
    if (tok.type !== type || (value !== undefined && tok.value !== value)) {
      throw new Error(
        `Expected ${type}${value ? ` "${value}"` : ""}, got ${tok.type} "${
          tok.value
        }"`
      );
    }
    this.next();
  }

  parse(): ASTNode[] {
    const statements: ASTNode[] = [];
    while (this.peek().type !== "EOF") {
      const stmt = this.parseStatement();
      if (stmt) statements.push(stmt);
    }
    return statements;
  }

  private parseStatement(): ASTNode | null {
    while (this.peek().type === "SKIP") this.next();
    if (this.peek().type === "EOF") return null;

    const tok = this.peek();

    if (tok.type === "WHEN") {
      this.next();
      const cond = this.parseCondition();
      const thenStmt = this.parseStatement();
      let elseStmt: ASTNode | null = null;
      if (this.peek().type === "OTHERWISE") {
        this.next();
        elseStmt = this.parseStatement();
      }
      return new When(cond, thenStmt, elseStmt);
    }

    if (tok.type === "REPEAT") {
      this.next();
      const variable = this.next().value;
      this.expect("THROUGH");
      const iterable = this.parseExpr();
      const body = this.parseStatement();
      return new Repeat(variable, iterable, body);
    }

    if (tok.type === "ECHO") {
      this.next();
      const expr = this.parseExpr();
      return new Echo(expr);
    }

    if (tok.type === "DECLARE") {
      this.next();
      const name = this.next().value;
      this.expect("EQUAL");
      const expr = this.parseExpr();
      return new Declare(name, expr);
    }

    if (tok.type === "IDENT") {
      const name = this.next().value;
      this.expect("EQUAL");
      const expr = this.parseExpr();
      return new Declare(name, expr);
    }

    this.next();
    return null;
  }

  private parseCondition(): ASTNode {
    const left = this.parseExpr();
    const op = this.next();
    const right = this.parseExpr();
    return new BinOp(left, op.value, right);
  }

  private parseExpr(): ASTNode {
    let node: ASTNode = this.parseTerm();
    while (["PLUS", "MINUS"].includes(this.peek().type)) {
      const op = this.next().value;
      node = new BinOp(node, op, this.parseTerm());
    }
    return node;
  }

  private parseTerm(): ASTNode {
    if (this.peek().type === "LBRACKET") {
      this.next();
      const elements: ASTNode[] = [];
      if (this.peek().type !== "RBRACKET") {
        while (true) {
          elements.push(this.parseExpr());
          if (this.peek().type === "RBRACKET") break;
          this.expect("COMMA");
        }
      }
      this.expect("RBRACKET");
      return new ArrayLit(elements);
    }

    const tok = this.next();
    if (tok.type === "NUMBER") return new Num(parseInt(tok.value));
    if (tok.type === "STRING") return new Str(tok.value.slice(1, -1));
    if (tok.type === "IDENT") return new Var(tok.value);
    throw new Error(`Invalid expression: ${tok.value}`);
  }
}

const variables: Record<string, any> = {};

function evaluate(node: ASTNode): any {
  if (node instanceof Num) return node.value;
  if (node instanceof Str) return node.value;
  if (node instanceof Var) return variables[node.name] ?? null;
  if (node instanceof BinOp) {
    const l = evaluate(node.left);
    const r = evaluate(node.right);
    switch (node.op) {
      case "+":
        return l + r;
      case "-":
        return l - r;
      case ">":
        return l > r ? 1 : 0;
      case "<":
        return l < r ? 1 : 0;
      case "==":
        return l === r ? 1 : 0;
      default:
        return 0;
    }
  }
  if (node instanceof ArrayLit) {
    return node.elements.map(evaluate);
  }
  return null;
}

function executeStatement(stmt: ASTNode) {
  if (stmt instanceof Declare) {
    variables[stmt.target] = evaluate(stmt.expr);
  } else if (stmt instanceof Echo) {
    console.log(evaluate(stmt.expr));
  }
}

export function run(code: string): string {
  let output = "";
  const originalLog = console.log;
  console.log = (msg) => {
    output += msg + "\n";
  };

  try {
    const tokens = lexer(code);
    const parser = new Parser(tokens);
    const ast = parser.parse();

    for (const stmt of ast) {
      if (!stmt) continue;

      if (stmt instanceof Declare) {
        executeStatement(stmt);
      } else if (stmt instanceof Echo) {
        executeStatement(stmt);
      } else if (stmt instanceof When) {
        const cond = evaluate(stmt.condition);
        if (cond) {
          if (stmt.thenStmt) executeStatement(stmt.thenStmt);
        } else if (stmt.elseStmt) {
          executeStatement(stmt.elseStmt);
        }
      } else if (stmt instanceof Repeat) {
        const iterable = evaluate(stmt.iterable);
        if (!Array.isArray(iterable)) {
          throw new Error("through expects an array");
        }
        for (const item of iterable) {
          variables[stmt.variable] = item;
          if (stmt.body) executeStatement(stmt.body);
        }
      }
    }
  } catch (e: any) {
    output += `Error: ${e.message}\n`;
  }

  console.log = originalLog;
  return output.trim();
}
