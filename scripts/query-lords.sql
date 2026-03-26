SELECT account_address, balance, username
FROM token_balances AS tb
JOIN controllers AS c ON tb.account_address = c.address
WHERE contract_address = '0x0124aeb495b947201f5fac96fd1138e326ad86195b98df6dec9009158a533b49'
ORDER BY balance DESC;