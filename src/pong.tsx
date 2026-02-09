import React, { useState, useEffect, useRef } from 'react';
import createBall from './ball';
import createPlayer from './player';
import createAI from './ai';

interface PongProps {
  height?: number;
  width?: number;
  upArrow?: string;
  downArrow?: string;
  ballSize?: number;
  paddleHeight?: number;
  paddleWidth?: number;
  paddleSpeed?: number;
}

interface PongState {
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

const Pong: React.FC<PongProps> = ({
  height = 600,
  width = 700,
  upArrow = 'ArrowUp',
  downArrow = 'ArrowDown',
  paddleHeight = 100,
  paddleWidth = 20,
  paddleSpeed = 5,
  ballSize = 10
}) => {
  const [state, setState] = useState<PongState>({
    ballx: 100,
    bally: 100,
    ballSpeed: 2,
    velx: 0,
    vely: 0,
    aix: 670,
    aiy: 100,
    playerx: 10,
    playery: 100,
    playerScore: 0,
    aiScore: 0
  });

  interface GameComponent {
    update: () => void;
    draw: () => void;
    name: () => string;
    position: (y?: number) => { x: number; y: number };
  }

  interface Ball extends Omit<GameComponent, 'position' | 'name'> {
    serve: (side: number) => void;
    position?: never;
    name?: never;
  }

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const keystateRef = useRef<{ [key: string]: boolean }>({});
  const loopRef = useRef<number | null>(null);
  const stateRef = useRef(state);
  const ballRef = useRef<Ball | null>(null);
  const playerRef = useRef<GameComponent | null>(null);
  const aiRef = useRef<GameComponent | null>(null);

  // Keep stateRef in sync with state
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const canvasStyle: React.CSSProperties = {
    display: 'block',
    position: 'absolute',
    margin: 'auto',
    top: '0',
    bottom: '0',
    left: '0',
    right: '0'
  };

  const props = { height, width, upArrow, downArrow, paddleHeight, paddleWidth, paddleSpeed, ballSize };

  const setupCanvas = () => {
    if (canvasRef.current) {
      contextRef.current = canvasRef.current.getContext('2d');
    }
  };

  const score = (name: string) => {
    const scorer = name === 'player' ? 'ai' : 'player';
    const scorerKey = (scorer + 'Score') as keyof PongState;
    setState(prevState => ({
      ...prevState,
      [scorerKey]: prevState[scorerKey] + 1
    }));

    stopGame();

    setTimeout(() => {
      if (contextRef.current) {
        contextRef.current.font = '30px Arial';
        contextRef.current.fillStyle = '#fff';
        contextRef.current.fillText(
          scorer + ' score!',
          width / 2,
          height / 2
        );
        contextRef.current.restore();
      }
    }, 0);

    setTimeout(() => {
      setupCanvas();
      startGame();
    }, 1000);
  };

  const getComponentContext = () => ({
    get _context() { return contextRef.current; },
    get state() { return stateRef.current; },
    props,
    _keystate: keystateRef.current,
    setState: (updater: (prevState: PongState) => PongState) => { setState(updater); },
    _score: score
  });

  // Initialize game objects once
  if (!playerRef.current) {
    playerRef.current = createPlayer.call(getComponentContext());
  }
  if (!aiRef.current) {
    aiRef.current = createAI.call(getComponentContext());
  }
  if (!ballRef.current) {
    ballRef.current = createBall.call(
      getComponentContext(),
      () => playerRef.current as GameComponent,
      () => aiRef.current as GameComponent
    );
  }

  const ball = ballRef.current;
  const player = playerRef.current;
  const ai = aiRef.current;

  const draw = () => {
    if (!contextRef.current) return;

    const context = contextRef.current;

    // draw background
    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    context.save();
    context.fillStyle = "#fff";

    // draw scoreboard
    context.font = '10px Arial';
    context.fillText('Player: ' + String(state.playerScore), 10, 10);
    context.fillText('CPU: ' + String(state.aiScore), 500, 10);

    // draw ball
    ball.draw();

    // draw paddles
    player.draw();
    ai.draw();

    // draw the net
    const w = 4;
    const x = (width - w) * 0.5;
    let y = 0;
    const step = height / 20;
    while (y < height) {
      context.fillRect(x, y + step * 0.25, w, step * 0.5);
      y += step;
    }

    context.restore();
  };

  const update = () => {
    player.update();
    ai.update();
    ball.update();
  };

  const stopGame = () => {
    if (loopRef.current !== null) {
      clearInterval(loopRef.current);
      loopRef.current = null;
    }
    setTimeout(() => {
      if (contextRef.current && canvasRef.current) {
        contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, 0);
  };

  const startGame = () => {
    if (loopRef.current) {
      return;
    }

    const keystate = keystateRef.current;

    const handleKeyDown = (evt: KeyboardEvent) => {
      keystate[evt.code] = true;
    };

    const handleKeyUp = (evt: KeyboardEvent) => {
      keystate[evt.code] = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    document.addEventListener('touchstart', handleTouchStart, false);
    document.addEventListener('touchmove', handleTouchMove, false);

    loopRef.current = window.setInterval(() => {
      update();
      draw();
    }, 1);

    ball.serve(1);
  };

  const handleTouch = (evt: React.TouchEvent<HTMLCanvasElement>) => {
    if (canvasRef.current) {
      const yPos = evt.touches[0].pageY - canvasRef.current.offsetTop - paddleHeight / 2;
      player.position(yPos);
    }
  };

  useEffect(() => {
    setupCanvas();
    if (contextRef.current) {
      contextRef.current.font = '30px Arial';
      contextRef.current.fillText('Starting Game', width / 2, height / 2);
    }

    const timer = setTimeout(startGame, 1000);

    return () => {
      clearTimeout(timer);
      stopGame();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      onTouchStart={handleTouch}
      onTouchMove={handleTouch}
      style={canvasStyle}
      width={width}
      height={height}
    />
  );
};

export default Pong;
