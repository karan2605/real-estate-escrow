// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

interface IERC721 {
    function transferFrom(
        address _from,
        address _to,
        uint256 _tokenId
    ) external;
}

contract Escrow {
    address public nftAddress;
    address payable public seller;
    address public inspector;
    address public lender;

    modifier onlyBuyer() {
        require(msg.sender == buyer, "Only buyer can call this method");
        _;
    }

    modifier onlySeller() {
        require(msg.sender == seller, "Only seller can call this method");
        _;
    }

    modifier onlyInspector() {
        require(msg.sender == inspector, "Only inspector can call this method");
        _;
    }

    mapping(uint256 => bool) public isListed;
    mapping(uint256 => uint256) public purchasePrice;
    mapping(uint256 => uint256) public escrowAmount;
    mapping(uint256 => address) public buyer;
    mapping(uint256 => bool) public inspectionPassed;
    mapping(uint256 => mapping(address => bool)) public approval;

    receive() external payable {} // Let smart contract receive funds

    constructor(
        address _nftAddress,
        address payable _seller,
        address _inspector,
        address _lender
    ) {
        nftAddress = _nftAddress;
        seller = _seller;
        inspector = _inspector;
        lender = _lender;
    }

    function list(
        uint256 _nftID,
        address _buyer,
        uint256 _purchasePrice,
        uint256 _escrowAmount
    ) public payable onlySeller {
        // Transfer NFT from seller to this contract
        IERC721(nftAddress).transferFrom(msg.sender, address(this), _nftID);

        isListed[_nftID] = true;
        purchasePrice[_nftID] = _purchasePrice;
        escrowAmount[_nftID] = _escrowAmount;
        buyer[_nftID] = _buyer;
    }

    // Put Under Contract (only buyer - payable escrow)
    function depositEarnest() public payable onlyBuyer {
        require(msg.value >= escrowAmount);
    }

    // Update Inspection Status (only inspector)
    function updateInspectionStatus(uint256 _nftID, bool _passed)
        public
        onlyInspector
    {
        inspectionPassed[_nftID] = _passed;
    }

    // Approve Sale
    function approveSale(uint256 _nftID) public {
        approval[_nftID][msg.sender] = true;
    }

    function getBalance() public view returns(uint) {
        return address(this).balance;
    }


    function finalizeSale() public {
        require(inspectionPassed, 'must pass inspection');
        require(approval[buyer], "must be approved by buyer");
        require(approval[seller], "must be approved by seller");
        require(approval[lender], "must be approved by lender");
        require(address(this).balance >= purchasePrice, "must have enough ether for sale");

        (bool success, ) = payable(seller).call{value: address(this).balance}("");
        require(success);

        // Transfer ownership of property
        IERC721(nftAddress).transferFrom(seller, buyer, nftID);
    }

    // Cancel Sale (handle earnest deposit)
    // -> if inspection status is not approved, then refund, otherwise send to seller
    function cancelSale(uint256 _nftID) public {
        if (inspectionPassed[_nftID] == false) {
            payable(buyer[_nftID]).transfer(address(this).balance);
        } else {
            payable(seller).transfer(address(this).balance);
        }
    }
}
