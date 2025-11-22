import 'bootstrap/dist/css/bootstrap.min.css';
import { createRoot } from 'react-dom/client'
import './index.css'
import './styles/theme.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
    <div className="app-shell">
        <App />
    </div>
)
