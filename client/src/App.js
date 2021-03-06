import React, { Component } from "react";
import SimpleStorageContract from "./contracts/SimpleStorage.json";
import getWeb3 from "./getWeb3";
import { create } from "ipfs-http-client"

import "./App.css";

class App extends Component {

	constructor(props){
    super(props)

    // Set initial state
    this. state = { storageValue: 0, web3: null, accounts: null, contract: null,img_hash: "",file: null };

	this.client = create("https://ipfs.infura.io:5001/api/v0")
    // Binding this keyword
    this.picChange = this.picChange.bind(this)
	this.addImage = this.addImage.bind(this)
  }

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = SimpleStorageContract.networks[networkId];
      const instance = new web3.eth.Contract(
        SimpleStorageContract.abi,
        deployedNetwork && deployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      this.setState({ web3, accounts, contract: instance }, this.runExample);
		instance.methods.get().call().then((ipfsHash) => {
		this.setState({img_hash: ipfsHash})
		}).catch((err) => console.log(err))
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

 /* runExample = async () => {
    const { accounts, contract } = this.state;

    // Stores a given value, 5 by default.
    await contract.methods.set(5).send({ from: accounts[0] });

    // Get the value from the contract to prove it worked.
    const response = await contract.methods.get().call();

    // Update state with the result.
    this.setState({ storageValue: response });
  };*/
	picChange(e){
		console.log(e.target.files[0])
		this.setState({file: e.target.files[0]})
	}

	async addImage(e){
    	const { accounts, contract } = this.state;
		console.log(this.client)
		e.preventDefault()
		const added = await this.client.add(this.state.file)
		await contract.methods.set(added.path).send({ from: accounts[0] })
		const response = contract.methods.get().call().
			then((ipfsHash) =>{
			console.log("Ipfs:" + ipfsHash)
			this.setState({img_hash: ipfsHash})
			} ).catch((err) => console.log(err))
	}

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
		<h1>Your Image</h1>
		<img src= {`https://ipfs.infura.io/ipfs/${this.state.img_hash}`} style={{ width: "500px",height: "500px"  }} />
		<form onSubmit={this.addImage} >
			<input type="file" onChange={this.picChange} style={{ marginTop: "100px"  }} />
			<button type="submit">Submit</button>
		</form>
      </div>
    );
  }
}

export default App;
