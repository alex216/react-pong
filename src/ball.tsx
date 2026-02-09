interface State {
  ballx: number;
  bally: number;
  ballSpeed: number;
  velx: number;
  vely: number;
  aix: number;
  aiy: number;
  playerx: number;
  playery: number;
  playerScore: number;
  aiScore: number;
}

interface Paddle {
  name: () => string;
  position: () => { x: number; y: number };
  update: () => void;
  draw: () => void;
}

interface ComponentContext {
  _context: CanvasRenderingContext2D | null;
  state: State;
  props: {
    height: number;
    width: number;
    upArrow: string;
    downArrow: string;
    ballSize: number;
    paddleHeight: number;
    paddleWidth: number;
    paddleSpeed: number;
  };
  setState: (updater: (prevState: State) => State) => void;
  _score: (name: string) => void;
}

export default function createBall(this: ComponentContext, getPlayer: () => Paddle, getAI: () => Paddle) {
  const pi = Math.PI;
  const getContext = () => this._context;
  const props = this.props;
  const score = this._score;
  const getState = () => this.state;
  const setState = (updater: (prevState: State) => State) => {
    this.setState(updater);
  };
  const r = Math.random();

  return {
    serve(side: number) {
      const phi = 0.1 * pi * (1 - 2 * r);
      setState((prevState: State) => ({
        ...prevState,
        ballx: side === 1 ? prevState.playerx + props.paddleWidth : prevState.aix - props.ballSize,
        bally: (props.height - props.ballSize) * r,
        velx: prevState.ballSpeed * Math.cos(phi) * side,
        vely: prevState.ballSpeed * Math.sin(phi)
      }));
    },
    update() {
      const player = getPlayer();
      const ai = getAI();
      const currentState = getState();
      const bx = currentState.ballx;
      const by = currentState.bally;
      const vx = currentState.velx;
      const vy = currentState.vely;

      setState((prevState: State) => ({
        ...prevState,
        ballx: bx + vx,
        bally: by + vy
      }));

      if (0 > by || by + props.ballSize > props.height) {
        const offset = currentState.vely < 0 ? 0 - currentState.bally : props.height - (currentState.bally + props.ballSize);
        setState((prevState: State) => ({
          ...prevState,
          bally: by + 2 * offset,
          vely: vy * -1
        }));
      }

      const pdle = currentState.velx < 0 ? player : ai;

      const AABBIntersect = (
        paddleX: number,
        paddleY: number,
        pWidth: number,
        pHeight: number,
        bx: number,
        by: number,
        bw: number,
        bh: number
      ) => {
        return (
          paddleX < bx + bw &&
          paddleY < by + bh &&
          bx < paddleX + pWidth &&
          by < paddleY + pHeight
        );
      };

      if (
        AABBIntersect(
          pdle.position().x,
          pdle.position().y,
          props.paddleWidth,
          props.paddleHeight,
          currentState.ballx,
          currentState.bally,
          props.ballSize,
          props.ballSize
        )
      ) {
        const dir = currentState.velx < 0 ? 1 : -1;
        const n = (currentState.bally + props.ballSize - pdle.position().y) / (props.paddleHeight + props.ballSize);
        const ydir = (n > 0.5 ? -1 : 1) * dir;
        const phi = 0.25 * pi * (2 * n + dir) + r;
        const smash = Math.abs(phi) > 0.2 * pi ? 1.1 : 1;

        setState((prevState: State) => ({
          ...prevState,
          ballx: pdle === player ? prevState.playerx + props.paddleWidth : prevState.aix - props.ballSize,
          velx: smash * -1 * prevState.velx,
          vely: smash * ydir * prevState.velx * Math.sin(phi)
        }));
      }

      if (0 > currentState.ballx + props.ballSize || currentState.ballx > props.width) {
        score(pdle.name());
        this.serve(pdle.name() === player.name() ? 1 : -1);
      }
    },
    draw() {
      const context = getContext();
      if (!context) return;
      const currentState = getState();
      context.beginPath();
      context.arc(currentState.ballx, currentState.bally, props.ballSize, 0, 2 * Math.PI);
      context.fill();
      context.lineWidth = 0;
      context.strokeStyle = '#fff';
      context.stroke();
    }
  };
}
