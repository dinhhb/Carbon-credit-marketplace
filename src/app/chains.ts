import { defineChain } from "thirdweb";

// const myChain = defineChain(11155111);

const myChain = defineChain({
  id: 1337,
  rpc: "http://127.0.0.1:7545",
  nativeCurrency: {
    name: "Ethereum",
    symbol: "ETH",
    decimals: 18,
  },
});

export { myChain };
