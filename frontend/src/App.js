import {useEffect, useState} from "react";
import {useEthers} from "@usedapp/core";
import {providers, utils} from "ethers";
import {getAllPosts, getDeployedContract} from "./contractUtils";
import {CircularProgress} from "@mui/material";
import Identicon from 'identicon.js';

function App() {
    const [contract, setContract] = useState(null)
    const [posts, setPosts] = useState([])
    const [content, setContent] = useState("")
    const [loading, setLoading] = useState(false)

    const {account, activateBrowserWallet, deactivate, chainId} = useEthers()

    const isConnected = account !== undefined

    useEffect(() => {
        const provider = new providers.Web3Provider(window.ethereum, "any")
        provider.on("network", (newNetwork, oldNetwork) => {
            // When a Provider makes its initial connection, it emits a "network"
            // event with a null oldNetwork along with the newNetwork. So, if the
            // oldNetwork exists, it represents a changing network
            if (oldNetwork) {
                window.location.reload()
            }
        })
    }, [])

    useEffect(() => {
        if (!account || contract)
            return
        const run = async () => {
            setLoading(true)
            const contract = await getDeployedContract()
            if (contract) {
                setContract(contract)
                refresh(contract)
            } else {
                window.alert('Please connect to Rinkeby Test Network')
            }
        }
        run()
    }, [account, chainId])

    const refresh = async (contract) => {
        setLoading(true)
        const posts = await getAllPosts(contract)
        setPosts(posts.sort((p1, p2) => p2.tipAmount - p1.tipAmount))
        setLoading(false)
    }

    const createPost = async (e) => {
        e.preventDefault()
        setLoading(true)
        setContent("")
        try {
            const tx = await contract.createPost(content)
            await tx.wait(1)
            await refresh(contract)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    const tipPost = async (id) => {
        setLoading(true)
        try {
            const tx = await contract.tipPost(id, {value: utils.parseEther('0.01')})
            await tx.wait(1)
            await refresh(contract)
        } catch (e) {
            console.error(e)
        }
        setLoading(false)
    }

    return (
        <div style={{width: "40%", marginLeft: "30%"}}>
            {
                loading
                    ? <div style={{height: "100vh", display: "flex", justifyContent: "center", alignItems: "center"}}>
                        <CircularProgress size={80}/>
                    </div>
                    : <div>
                        {
                            isConnected ?
                                <button className="btn btn-secondary"
                                        style={{position: "absolute", right: 30}}
                                        onClick={deactivate}
                                >
                                    Disconnect
                                </button>
                                : ""
                        }
                        <h2 className="mt-3" style={{textAlign: "center"}}>Social Network</h2>
                        <hr/>
                        <br/>
                        {
                            isConnected
                                ? <div>
                                    <form style={{width: "100%"}} onSubmit={createPost}>
                                        <input type="text" className="form-control mb-3" placeholder={"What's on your mind?"}
                                               value={content} onChange={e => setContent(e.target.value)} required/>
                                        <button type="submit" className="btn btn-primary w-100">Share</button>
                                    </form>
                                    <br/><br/>
                                    {
                                        posts.map(post =>
                                            <div className="card mb-5">
                                                <div className="card-header">
                                                    <img
                                                        className='mr-2'
                                                        width='30'
                                                        height='30'
                                                        src={`data:image/png;base64,${new Identicon(post.author, 30).toString()}`}
                                                    />
                                                    <span className="ms-2">{post.author}</span>
                                                </div>
                                                <p className="mt-3 ms-4" style={{fontSize: 18}}>{post.content}</p>
                                                <hr className="mb-0"/>
                                                <div className="ms-4"
                                                     style={{
                                                         display: "flex",
                                                         justifyContent: "space-between",
                                                         alignItems: "center"
                                                     }}>
                                                    <span className="text-muted mt-2 mb-2">TIPS: {post.tipAmount} ETH</span>
                                                    {
                                                        post.author !== account
                                                            ? <button className="btn btn-link" style={{textDecoration: "none"}}
                                                                      onClick={() => tipPost(post.id)}>
                                                                Tip 0.01 ETH
                                                            </button>
                                                            : ""
                                                    }
                                                </div>
                                            </div>
                                        )
                                    }
                                </div>
                                : <div style={{textAlign: "center"}}>
                                    <p style={{fontSize: 20}}>Connect to your Metamask wallet</p>
                                    <button className="btn btn-primary" onClick={activateBrowserWallet}>Connect</button>
                                </div>
                        }
                    </div>
            }
        </div>
    );
}

export default App;
