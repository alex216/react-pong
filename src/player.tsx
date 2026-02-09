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
  _keystate: { [key: string]: boolean };
  setState: (updater: (prevState: State) => State) => void;
}

export default function createPlayer(this: ComponentContext) {
  const getContext = () => this._context;
  const props = this.props;
  const keystate = this._keystate;
  const getState = () => this.state;
  const setState = (updater: (prevState: State) => State) => {
    this.setState(updater);
  };

  return {
    update() {
      const currentState = getState();
      let py = currentState.playery;
      if (keystate[props.upArrow]) {
        py = currentState.playery - props.paddleSpeed;
      }
      if (keystate[props.downArrow]) {
        py = currentState.playery + props.paddleSpeed;
      }
      // keep the paddle inside of the canvas
      py = Math.max(Math.min(py, props.height - props.paddleHeight), 0);
      setState((prevState: State) => ({ ...prevState, playery: py }));
    },
    draw() {
      const context = getContext();
      if (!context) return;
      const currentState = getState();
      context.fillRect(currentState.playerx, currentState.playery, props.paddleWidth, props.paddleHeight);
    },
    name() {
      return 'player';
    },
    position(y?: number) {
      if (y !== undefined) {
        setState((prevState: State) => ({ ...prevState, playery: y }));
      }
      const currentState = getState();
      return {
        x: currentState.playerx,
        y: currentState.playery
      };
    }
  };
}
