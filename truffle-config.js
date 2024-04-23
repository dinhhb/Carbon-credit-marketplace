module.exports = {
  contracts_build_directory: "./public/contracts",
  plugins: ["truffle-contract-size"],
  networks: {
    development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 7545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
    },
  },
  compilers: {
    solc: {
      version: "0.8.13"
    },
  }
};