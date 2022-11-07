import { useEffect, useState } from 'react';

// Bootstrap Elements
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col'

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false)
    const [hasLended, setHasLended] = useState(false)
    const [hasInspected, setHasInspected] = useState(false)
    const [hasSold, setHasSold] = useState(false)

    const [buyer, setBuyer] = useState(null)
    const [lender, setLender] = useState(null)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)

    const [owner, setOwner] = useState(null)

    const fetchDetails = async () => {
        // -- Buyer

        const buyer = await escrow.buyer(home.id)
        setBuyer(buyer)

        const hasBought = await escrow.approval(home.id, buyer)
        setHasBought(hasBought)

        // -- Seller

        const seller = await escrow.seller()
        setSeller(seller)

        const hasSold = await escrow.approval(home.id, seller)
        setHasSold(hasSold)

        // -- Lender

        const lender = await escrow.lender()
        setLender(lender)

        const hasLended = await escrow.approval(home.id, lender)
        setHasLended(hasLended)

        // -- Inspector

        const inspector = await escrow.inspector()
        setInspector(inspector)

        const hasInspected = await escrow.inspectionPassed(home.id)
        setHasInspected(hasInspected)
    }

    const fetchOwner = async () => {
        if (await escrow.isListed(home.id)) return

        const owner = await escrow.buyer(home.id)
        setOwner(owner)
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id)
        const signer = await provider.getSigner()

        // Buyer deposit earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount })
        await transaction.wait()

        // Buyer approves...
        transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        setHasBought(true)
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner()

        // Inspector updates status
        const transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true)
        await transaction.wait()

        setHasInspected(true)
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner()

        // Lender approves...
        const transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Lender sends funds to contract...
        const lendAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id))
        await signer.sendTransaction({ to: escrow.address, value: lendAmount.toString(), gasLimit: 60000 })

        setHasLended(true)
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner()

        // Seller approves...
        let transaction = await escrow.connect(signer).approveSale(home.id)
        await transaction.wait()

        // Seller finalize...
        transaction = await escrow.connect(signer).finalizeSale(home.id)
        await transaction.wait()

        setHasSold(true)
    }

    useEffect(() => {
        fetchDetails()
        fetchOwner()
    }, [hasSold])

    return (
        <div className='home'>
            <Modal className="home__details" size="xl" centered show={true}>
                <Modal.Header className="bg-dark">
                    <Modal.Title id="contained-modal-title-vcenter">
                    <h1>{home.name}</h1>
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="home__overview">
                    <Container>
                    <Row>
                        <Col>
                            <div className="home__image ">
                                <img src={home.image} alt="Home" />
                            </div>
                        </Col>
                        <Col>
                            <p>
                                <strong>{home.attributes[2].value}</strong> bds |
                                <strong>{home.attributes[3].value}</strong> ba |
                                <strong>{home.attributes[4].value}</strong> sqft
                            </p>
                            <p>{home.address}</p>

                            <h2>{home.attributes[0].value} ETH</h2>

                            {owner ? (
                                <div className='home__owned'>
                                    Owned by {owner.slice(0, 6) + '...' + owner.slice(38, 42)}
                                </div>
                            ) : (
                                <div>
                                    {(account === inspector) ? (
                                        <Button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                            Approve Inspection
                                        </Button>
                                    ) : (account === lender) ? (
                                        <Button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                            Approve & Lend
                                        </Button>
                                    ) : (account === seller) ? (
                                        <Button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                            Approve & Sell
                                        </Button>
                                    ) : (
                                        <Button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                            Buy
                                        </Button>
                                    )}

                                    <Button className='home__contact'>
                                        Contact agent
                                    </Button>
                                </div>
                            )}

                            <hr />

                            <h2>Overview</h2>

                            <p>
                                {home.description}
                            </p>

                            <hr />

                            <h2>Facts and features</h2>

                            <ul>
                                {home.attributes.map((attribute, index) => (
                                    <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                                ))}
                            </ul>
                        </Col>
                    </Row>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={togglePop}>Close</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default Home;