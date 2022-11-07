import { ethers } from 'ethers';
import logo from '../assets/logo.svg';
import Nav from 'react-bootstrap/Nav';
import Button from 'react-bootstrap/Button';
import Navbar from 'react-bootstrap/Navbar';

const Navigation = ({ account, setAccount }) => {
    const connectHandler = async () => {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = ethers.utils.getAddress(accounts[0])
        setAccount(account);
    }

    return (
        <Navbar variant="dark" bg="dark" fixed="top">
            <Nav className="me-auto">
                <Nav.Link href="#home">Buy</Nav.Link>
                <Nav.Link href="#features">Rent</Nav.Link>
                <Nav.Link href="#pricing">Sell</Nav.Link>
            </Nav>
     

            <Nav.Item>
                <div className='nav__brand'>
                    <img src={logo} alt="Logo" />
                    <Navbar.Brand href="#home">DecentrEstate</Navbar.Brand>
                </div>
            </Nav.Item>

            <Nav.Item>
                {account ? (
                    <Button
                        type="button"
                        className='justify-content-center'
                    >
                        {account.slice(0, 6) + '...' + account.slice(38, 42)}
                    </Button>
                ) : (
                    <Button
                        type="button"
                        className="justify-content-end"
                        onClick={connectHandler}
                    >
                        Connect
                    </Button>
                )}
            </Nav.Item>
        </Navbar>
    );
}

export default Navigation;