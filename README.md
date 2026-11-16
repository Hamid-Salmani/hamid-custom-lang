# EchoLang

A small interpreted programming language implemented in TypeScript. EchoLang is an educational project for exploring the building blocks of a language: tokenization, parsing, an abstract syntax tree, and interpretation.

## What it supports

- Variables declared with `declare` (or assigned with `name = value`)
- Integer and double-quoted string literals
- Array literals
- Addition and subtraction, plus string concatenation with `+`
- Comparisons with `>`, `<`, and `==` in conditions
- `when` / `otherwise` conditionals
- `repeat ... through ...` iteration over arrays
- Output with `echo`

The syntax uses keywords such as `echo`, `when`, `otherwise`, `declare`, `repeat`, and `through`. Statements do not require semicolons or braces.

## Getting started

### Requirements

- Node.js
- npm

### Install and run

```bash
npm install
npx tsx run.ts program.sl
```

Pass the path to any EchoLang source file (`.sl`) as the final argument.

## Example

```text
declare name = "Hamid"
declare age = 25

echo "Hello, " + name

when age > 18
  echo "Adult"
otherwise
  echo "Not an adult"

repeat number through [1, 2, 3]
  echo "Number: " + number
```

Running the example prints:

```text
Hello, Hamid
Adult
Number: 1
Number: 2
Number: 3
```

The repository includes a runnable sample in [`program.sl`](program.sl).

## Syntax reference

| Construct | Example |
| --- | --- |
| Output | `echo "Hello"` |
| Variable declaration | `declare score = 10` |
| Assignment | `score = score + 1` |
| Array | `[1, 2, 3]` |
| Conditional | `when score > 10` followed by one statement |
| Alternative | `otherwise` followed by one statement |
| Array iteration | `repeat item through items` followed by one statement |

## Current limitations

EchoLang is a minimal prototype, not a general-purpose language. Conditional and loop bodies currently execute a single statement; nested blocks are not supported. Numbers are integers, strings use double quotes without escape sequences, and the available operators are `+`, `-`, `>`, `<`, and `==`. Loops require an array.

## Project layout

- `language.ts` — lexer, parser, AST, and interpreter
- `run.ts` — command-line runner
- `program.sl` — sample EchoLang program