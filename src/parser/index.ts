import Tokenizr, {Token} from 'tokenizr';

const tokenize = (input: string): Token[] => {
  const lexer = new Tokenizr();

  // lexer.rule(//, (ctx, match) => {
  //   ctx.accept('left_paren');
  // });
  lexer.rule(/[a-zA-Z_][a-zA-Z0-9_]*/, (ctx, match) => {
    ctx.accept('id');
  });
  lexer.rule(/./, (ctx, match) => {
    ctx.accept('char');
  });
  lexer.rule(/[ \t\r\n]+/, (ctx, match) => {
    ctx.ignore();
  });
  lexer.rule(/\./, (ctx, match) => {
    ctx.accept('dot');
  });
  lexer.input(input);
  return lexer.tokens();
};

export const parseName = (
  name: string
):
  | {
      type: 'function';
      argumentLayout: string[];
      // levels, ie "awful.thing.a" = ['awful', 'thing', 'a'];
      name: string[];
      isSelf: boolean;
    }
  | {
      type: 'name';
      name: string;
    } => {
  const tokens = tokenize(name);

  const isFunc = tokens.some(token => token.isA('char', '('));

  if (isFunc) {
    const index = tokens.findIndex(token => token.isA('char', '('));
    const args = [];
    for (let i = index + 1; i < tokens.length; ++i) {
      const arg = tokens[i];
      if (arg.isA('char')) continue;
      args.push(arg.text);
    }

    const isSelf = !tokens
      .slice(0, index - 1)
      .some(token => token.isA('char', ':'));

    return {
      type: 'function',
      // todo: handle : and . differently
      name: tokens
        .slice(0, index - 1)
        .filter(token => token.isA('id'))
        .map(token => token.text),
      argumentLayout: args,
      isSelf,
    };
  }

  return {type: 'name', name};
};
