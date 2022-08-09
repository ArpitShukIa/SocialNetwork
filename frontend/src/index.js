import {StrictMode} from 'react';
import {render} from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import {DAppProvider, Rinkeby} from "@usedapp/core";

const root = document.getElementById('root');
render(
    <StrictMode>
        <DAppProvider config={{networks: [Rinkeby]}}>
            <App/>
        </DAppProvider>
    </StrictMode>,
    root
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
