SELECT 
    account_address,
    username, 
    COUNT(account_address) AS quantity
FROM token_balances AS tb
JOIN controllers AS c ON tb.account_address = c.address
WHERE contract_address = '0x036017e69d21d6d8c13e266eabb73ef1f1d02722d86bdcabe5f168f8e549d3cd'
GROUP BY username
ORDER BY quantity DESC;