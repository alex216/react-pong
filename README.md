# @alexium216/react-pong

A simple ping-pong game as a React component built with TypeScript.

![](http://i.imgur.com/tpm0k7u.gif)

Inspired by [Max Wihlborg](https://github.com/maxwihlborg/youtube-tutorials)

[See demo here](https://github.com/alexium216/react-pong)

## Installation

```bash
npm install --save @alexium216/react-pong
```

## Usage

```tsx
import Pong from "@alexium216/react-pong";

<Pong />;
```

### With custom props

```tsx
<Pong
  height={800}
  width={1000}
  ballSize={15}
  paddleHeight={120}
  paddleSpeed={7}
/>
```

## Props

All props are optional:

- `height` - Number - Height of canvas element in px - default: 600
- `width` - Number - Width of canvas element in px - default: 700
- `upArrow` - String - Key code for moving paddle up - default: 'ArrowUp'
- `downArrow` - String - Key code for moving paddle down - default: 'ArrowDown'
- `ballSize` - Number - Diameter of ball in px - default: 10
- `paddleHeight` - Number - Height of paddles in px - default: 100
- `paddleWidth` - Number - Width of paddles in px - default: 20
- `paddleSpeed` - Number - Pixels moved per key press - default: 5

## Development

```bash
npm install
npm run dev    # Start dev server
npm run build  # Build for production
```

## License

MIT
