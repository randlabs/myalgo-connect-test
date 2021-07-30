import React, { Component, ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';


class Footer extends Component {
	render(): ReactNode {
		return (
			<Container className="footer" fluid>
				<Row className="footer-row">
					<Col className="footer-col">
                        Powered by &nbsp;&copy;&nbsp;
						<a
							className="footer-link"
							href="https://www.randlabs.io"
							target="_blank"
							rel="noopener noreferrer"
						>
							Rand Labs
						</a>
					</Col>
					<Col className="footer-col">
						&copy;&nbsp;
						{new Date().getFullYear()}
						&nbsp;My Algo.&nbsp; All Rights Reserved
					</Col>
				</Row>
			</Container>
		);
	}
}

export default Footer;