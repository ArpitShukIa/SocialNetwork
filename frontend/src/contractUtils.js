import SocialNetwork from "./chain-info/contracts/SocialNetwork.json"
import networkMapping from "./chain-info/deployments/map.json"
import {Contract, providers, utils} from "ethers";

export const getDeployedContract = async () => {
    const {abi} = SocialNetwork
    const provider = new providers.Web3Provider(window.ethereum)
    const {chainId} = await provider.getNetwork()
    if (!chainId || !networkMapping[String(chainId)]) {
        return null
    }
    const contractAddress = networkMapping[String(chainId)]["SocialNetwork"][0]
    const contractInterface = new utils.Interface(abi)
    const contract = new Contract(contractAddress, contractInterface, provider.getSigner())
    return await contract.deployed()
}

export const getAllPosts = async (contract) => {
    const posts = []
    const count = await contract.postCount()
    for (let i = 1; i <= count; i++) {
        const {id, content, tipAmount, author} = await contract.posts(i)
        posts.push({
            id: +utils.formatUnits(id, 0),
            content,
            tipAmount: +utils.formatEther(tipAmount),
            author
        })
    }
    return posts
}
