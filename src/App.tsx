import React, { Component, ReactNode } from 'react';
import { Button } from 'reactstrap';
import PrismCode from './components/code/Code';
import './App.css';

import logo from './assets/images/MyAlgo.svg'

class App extends Component<{}> {
    render(): ReactNode {
        const code = `
        const foo = 'foo';
const bar = 'bar';
console.log(foo + bar);
        `;
        return (
            <div className="app">
                <img src={logo} className="myalgo-logo" alt="MyAlgo logo" />
                <PrismCode
                    code={code}
                    language="js"
                />
                <Button color="danger">
                    Danger!
                </Button>
            </div>
        );
    }
}

export default App;
