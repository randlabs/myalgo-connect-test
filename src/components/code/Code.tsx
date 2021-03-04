import React, { Component, RefObject } from 'react'
import Prism from 'prismjs'

interface ICodeProps {
    code: string;
    language: string;
    plugins?: string[];
}

class Code extends Component<ICodeProps> {
    private ref: RefObject<HTMLElement>
    
    constructor(props: ICodeProps) {
        super(props)

        this.ref = React.createRef();
    }

    componentDidMount(): void {
        this.highlight();
    }

    componentDidUpdate(): void {
        this.highlight();
    }

    highlight() {
        if (this.ref && this.ref.current) {
            Prism.highlightElement(this.ref.current)
        }
    }

    render() {
        const { code, plugins, language } = this.props
        
        return (
            <pre className={!plugins ? "" : plugins.join(" ")}>
                <code ref={this.ref} className={`language-${language}`}>
                {code.trim()}
                </code>
            </pre>
        )
    }
}

export default Code;
