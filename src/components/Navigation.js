import { ethers } from 'ethers';
import logo from '../assets/logo.svg';

import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';
import Container from 'react-bootstrap/Container';

const Navigation = ({ account, setAccount }) => {
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        <Navbar variant="dark" bg="dark" fixed="top">
            <Container>
                <Nav id="navbar">
                    <Button className="btn btn-primary me-2 btn-lg" href="#home">Buy</Button>
                    <Button className="btn btn-primary me-2 btn-lg" href="#features">Rent</Button>
                    <Button className="btn btn-primary me-2 btn-lg" href="#pricing">Sell</Button>
                </Nav>

                <Nav.Item>
                    <div className='nav__brand'>
                        <img src={logo} alt="Logo" />
                        <Navbar.Brand id="title" className="fs-1 fw-bold d-flex justify-content-center ">DecentrEstate</Navbar.Brand>
                    </div>
                </Nav.Item>

                <Nav.Item>
                    {account ? (
                        <Button 
                            className="btn btn-primary btn-lg justify-content-end"
                        >
                            {account.slice(0, 6) + '...' + account.slice(38, 42)}
                        </Button>
                    ) : (
                        <Button id="button"
                            className="btn btn-primary btn-lg justify-content-end"
                            onClick={connectHandler}
                        >
                            Connect
                        </Button>
                    )}
                </Nav.Item>
            </Container>
        </Navbar>
    );
}

export default Navigation;