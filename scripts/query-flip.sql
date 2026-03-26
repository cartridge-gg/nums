SELECT account_address, balance, username
FROM token_balances AS tb
JOIN controllers AS c ON tb.account_address = c.address
WHERE contract_address = '0x01bfe97d729138fc7c2d93c77d6d1d8a24708d5060608017d9b384adf38f04c7'
ORDER BY balance DESC;