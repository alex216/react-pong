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
}

export default function createAI(this: ComponentContext) {
  const getContext = () => this._context;
  const props = this.props;
  const getState = () => this.state;
  const setState = (updater: (prevState: State) => State) => {
    this.setState(updater);
  };

  return {
    update() {
      const currentState = getState();
      let py = currentState.aiy;
      const desty = currentState.bally - (props.paddleHeight - props.ballSize) * 0.5;
      py = py + (desty - py) * 0.1;
      setState((prevState: State) => ({ ...prevState, aiy: py }));
    },
    draw() {
      const context = getContext();
      if (!context) return;
      const currentState = getState();
      context.fillRect(currentState.aix, currentState.aiy, props.paddleWidth, props.paddleHeight);
    },
    name() {
      return 'ai';
    },
    position() {
      const currentState = getState();
      return {
        x: currentState.aix,
        y: currentState.aiy
      };
    }
  };
}
