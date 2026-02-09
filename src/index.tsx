import { createRoot } from 'react-dom/client';
import Pong from './pong';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<Pong />);
}
