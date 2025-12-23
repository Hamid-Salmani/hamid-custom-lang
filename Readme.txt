# EchoLang – A Completely Custom Programming Language

EchoLang is a fully custom, interpreted programming language I built from scratch in TypeScript.  
It features **100% original keywords** that exist in no other language:

- `echo` – print/output
- `when` – if condition
- `otherwise` – else
- `declare` – variable declaration
- `repeat through` – loop over arrays

No semicolons, no curly braces – clean, minimal syntax inspired by Python but completely unique.

## Features
- Variables with `declare`
- String concatenation with `+`
- Basic arithmetic and comparisons (`+`, `-`, `>`, `<`, `==`)
- Conditional blocks with `when`/`otherwise`
- Simple array iteration with `repeat through`
- Runs in Node.js or browser (with minor tweaks)

## Quick Example

```program
declare name = "Hamid"
declare age = 25

echo "Hello world!"
echo "My name is " + name

when age > 18
  echo "I'm an adult and I love coding!"
otherwise
  echo "Still young!"

declare numbers = [1, 2, 3, 4, 5]

repeat i through numbers
  echo "Count: " + i