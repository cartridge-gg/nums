SELECT account_address, balance, username
FROM token_balances AS tb
JOIN controllers AS c ON tb.account_address = c.address
WHERE contract_address = '0x00e5f10eddc01699dc899a30dbc3c9858148fa4aa0a47c0ffd85f887ffc4653e'
ORDER BY balance DESC;