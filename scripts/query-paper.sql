SELECT account_address, balance, username
FROM token_balances AS tb
JOIN controllers AS c ON tb.account_address = c.address
WHERE contract_address = '0x0410466536b5ae074f7fea81e5533b8134a9fa08b3dd077dd9db08f64997d113'
ORDER BY balance DESC;