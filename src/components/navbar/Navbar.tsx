import React, { Component, ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';

import logo from '../../assets/images/MyAlgoConnect.png';


class Navbar extends Component {
    render(): ReactNode {
        return (
            <Container className="top-toolbar" fluid>
				<Row className="top-toolbar-row">
					<Col
						className="top-toolbar-col"
					>
						<div id="my-algo-app">
                            <img className="toptoolbar-logo" src={logo} alt="App Logo" />
                        </div>
					</Col>
				</Row>
			</Container>
        );
    }
}

export default Navbar;
