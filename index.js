var http = require("http");
const fetch = require("isomorphic-fetch");

const PORT = process.env.PORT || 5000;

const addressesToExclude = [
  // Ledger vaults
  "bnb1thagrtfude74x2j2wuknhj2savucy2tx0k58y9", // foundation
  // "bnb10ddanx3y54fegy2qkxxuel87q8f4aj754sl3d5", // foundation hot
  "bnb1z0e67zsn4j8glndgzrcjdwlcpnmhpddkqkj822", // staking reserve
  "bnb1hn8ym9xht925jkncjpf7lhjnax6z8nv24fv2yq", // team #1
  "bnb1j2nkv2fe6rn2hur3vf052r00hdnaj27c3lp2w6", // team #2
  // TSS vaults
  "bnb10sy32my2tuhlhkcyxqpqtukglfu7cswkrdrmd5", // small vault
  "bnb1duw3nm4ehcrpxg9xwxpw9ya0kpuwyk4s7a0fzk", // medium vault
  "bnb1e82l2pjarhcpgy85mmlq8atuc5stfugaah29rz", // large vault
];

async function getTokenSupplyInfo() {
  const balances = await Promise.all(
    addressesToExclude.map((address) =>
      fetch(`https://dex.binance.org/api/v1/account/${address}`)
    )
  );
  const total = 1000000000;
  let circulating = total;
  for (let i = 0; i < balances.length; i++) {
    const balance = await balances[i].json();
    let sbyBalance = -1;
    balance.balances.some(({ symbol, free }) => {
      if (symbol === "SWINGBY-888") {
        sbyBalance = parseFloat(free);
        return true;
      }
      return false;
    });
    if (0 < sbyBalance) {
      circulating -= sbyBalance;
    }
  }
  return { total, circulating };
}

http
  .createServer(async function (req, res) {
    const { total, circulating } = await getTokenSupplyInfo();
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "*");
    res.setHeader("Content-Type", "application/json");
    if ((req.url || "").includes("circulating")) {
      res.write(circulating.toFixed(8));
    } else {
      res.write(total.toFixed(8));
    }
    res.end(); //end the response
  })
  .listen(PORT); //the server object listens on port 8080

console.log(`Server listening on port ${PORT}`);
