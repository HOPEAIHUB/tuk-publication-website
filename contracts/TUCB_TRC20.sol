// TUCB Token — TRC20 Smart Contract (TRON Network)
// Thimothism Universal Central Bank — TRC20 Standard
// LOLY Mandate Enforced | CGT Certified
// Network: TRON (TRC20)
// Compatible with: TronLink, Trust Wallet, Ledger

pragma solidity ^0.8.0;

interface ITRC20 {
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
}

contract TUCBToken is ITRC20 {
    string public constant name = "Thimothism Universal Central Bank Coin";
    string public constant symbol = "TUCB";
    uint8 public constant decimals = 6;
    uint256 private _totalSupply;
    
    mapping(address => uint256) private _balances;
    mapping(address => mapping(address => uint256)) private _allowances;
    
    // LOLY Code-Gate: Owner must pass LOLY verification
    address public lolAuthority;
    bool public lolVerified;
    
    constructor() {
        _totalSupply = 100000000 * 10**uint256(decimals); // 100M supply
        _balances[msg.sender] = _totalSupply;
        lolAuthority = msg.sender;
        lolVerified = true;
        emit Transfer(address(0), msg.sender, _totalSupply);
    }
    
    function totalSupply() external view returns (uint256) {
        return _totalSupply;
    }
    
    function balanceOf(address account) external view returns (uint256) {
        return _balances[account];
    }
    
    function transfer(address to, uint256 amount) external returns (bool) {
        require(lolVerified, "LOLY Gate: Not verified");
        require(_balances[msg.sender] >= amount, "Insufficient balance");
        _balances[msg.sender] -= amount;
        _balances[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        _allowances[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function allowance(address owner, address spender) external view returns (uint256) {
        return _allowances[owner][spender];
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(lolVerified, "LOLY Gate: Not verified");
        require(_balances[from] >= amount, "Insufficient balance");
        require(_allowances[from][msg.sender] >= amount, "Insufficient allowance");
        _balances[from] -= amount;
        _balances[to] += amount;
        _allowances[from][msg.sender] -= amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
